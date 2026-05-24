import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert, Platform, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';
import { database } from '../firebase';
import { ref, push, update, get } from 'firebase/database';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getTheme, sharedStyles } from '../theme';

export default function Admin({ isDark, userRole, setUserRole, setLoginVisible }) {
  // state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeBody, setNoticeBody] = useState('');
  const [gradeRecycle, setGradeRecycle] = useState('Primero');
  const [paperKg, setPaperKg] = useState('');
  const [globalTitle, setGlobalTitle] = useState('');
  const [globalPoints, setGlobalPoints] = useState('');

  const theme = getTheme(isDark);
  const grados = [
    'Primero',
    'Segundo',
    'Tercero',
    'Cuarto',
    'Quinto',
    'Sexto',
    'Septimo',
    'Octavo',
    'Noveno',
    'Decimo',
    'Once',
  ];

  // simple sound helper
  const playSound = async (type) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        type === 'success'
          ? require('../assets/sounds/success.mp3')
          : require('../assets/sounds/pop.mp3')
      );
      await sound.playAsync();
    } catch {}
  };

  if (userRole !== 'admin') {
    return (
      <View style={[styles.block, { backgroundColor: theme.background }]}>
        <Text style={[styles.blockTitle, { color: theme.text }]}>Área Restringida</Text>
        <Text style={styles.blockSub}>Requiere autorización de Docente del PRAES.</Text>
        <Pressable style={[styles.btn, { backgroundColor: theme.danger }]} onPress={() => {
          playSound('pop');
          setLoginVisible(true);
        }}>
          <Text style={styles.btnText}>Ingresar Credenciales</Text>
        </Pressable>
      </View>
    );
  }

  // ---------- Handlers ----------
  const publishNotice = async () => {
    if (!noticeTitle || !noticeBody) return;
    await push(ref(database, 'avisos/'), {
      titulo: noticeTitle,
      contenido: noticeBody,
      fecha: new Date().toLocaleDateString(),
    });
    setNoticeTitle('');
    setNoticeBody('');
    playSound('success');
    Alert.alert('Éxito', 'Aviso publicado en el sistema.');
  };

  const registerRecycle = async () => {
    if (!paperKg) return;
    const kilos = parseFloat(paperKg);
    const points = kilos * 15;
    const snap = await get(ref(database, 'Grados'));
    const data = snap.val();
    if (data) {
      const index = data.findIndex((g) => g?.name === gradeRecycle);
      if (index !== -1) {
        const updates = {};
        updates[`Grados/${index}/score`] = (data[index].score || 0) + points;
        updates[`Grados/${index}/history/reg_${Date.now()}`] = {
          Puntos: points,
          tipo: 'Papel',
          kg: kilos,
        };
        await update(ref(database), updates);
        setPaperKg('');
        playSound('success');
        Alert.alert('Éxito', `Se asignaron +${points} pts a ${gradeRecycle}`);
      }
    }
  };

  const createGlobalChallenge = async () => {
    if (!globalTitle || !globalPoints) return;
    const batch = {};
    const id = `reto_${Date.now()}`;
    grados.forEach((g) => {
      batch[`retos/${g}/${id}`] = {
        titulo: globalTitle,
        puntos: parseInt(globalPoints) || 0,
        completado: false,
      };
    });
    await update(ref(database), batch);
    setGlobalTitle('');
    setGlobalPoints('');
    playSound('success');
    Alert.alert('Éxito', 'Reto global creado.');
  };

  const exportPDF = async () => {
    playSound('pop');
    try {
      const snap = await get(ref(database, 'Grados'));
      const data = snap.val();
      let rows = '';
      if (data) {
        const sorted = data.filter(Boolean).sort((a, b) => (b.score || 0) - (a.score || 0));
        sorted.forEach((g, i) => {
          rows += `
            <tr style="border-bottom:1px solid #e5e5ea;">
              <td style="padding:12px; font-weight:bold; color:#ff9500;">${i + 1}°</td>
              <td style="padding:12px; font-weight:600;">Grado ${g.name}</td>
              <td style="padding:12px; text-align:right; font-weight:bold; color:#34c759;">
                ${g.score ? g.score.toFixed(1) : '0.0'} pts
              </td>
            </tr>`;
        });
      }
      const html = `
        <html>
          <body style="font-family:-apple-system,Helvetica,sans-serif; padding:40px; color:#1c1c1e; background:#fff;">
            <div style="border-bottom:3px solid #34c759; padding-bottom:15px; margin-bottom:20px;">
              <h1 style="font-size:26px; margin:0 0 5px 0; color:#1c1c1e;">Colegio Colombo Francés</h1>
              <p style="font-size:14px; margin:0; color:#34c759; font-weight:bold;">Reporte Oficial de Puntuación - Proyecto PRAES</p>
              <p style="font-size:11px; margin:5px 0 0 0; color:#8e8e93;">Generado el: ${new Date().toLocaleDateString()}</p>
            </div>
            <h2 style="font-size:18px; margin-bottom:15px; color:#1c1c1e;">Leaderboard / Tabla de Posiciones</h2>
            <table style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:#34c759; color:#fff;">
                  <th style="padding:12px; text-align:left; border-top-left-radius:8px;">Puesto</th>
                  <th style="padding:12px; text-align:left;">Curso</th>
                  <th style="padding:12px; text-align:right; border-top-right-radius:8px;">Puntaje</th>
                </tr>
              </thead>
              <tbody>
                ${rows || '<tr><td colspan="3" style="text-align:center; padding:20px; color:#8e8e93;">Sin datos registrados.</td></tr>'}
              </tbody>
            </table>
            <div style="margin-top:40px; text-align:center; font-size:11px; color:#8e8e93; border-top:1px solid #e5e5ea; padding-top:15px;">
              Este documento es un reflejo fiel de las métricas almacenadas en el Portal Digital del PRAES.
            </div>
          </body>
        </html>`;
      if (Platform.OS === 'web') {
        const { uri } = await Print.printToFileAsync({ html });
        const a = document.createElement('a');
        a.href = uri;
        a.download = 'Reporte_Puntuacion_PRAES.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri);
      }
    } catch {
      Alert.alert('Error', 'No se pudo generar el documento estructurado.');
    }
  };

  return (
    <ScrollView style={{ backgroundColor: theme.background }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Centro de Comando</Text>
        <Pressable style={styles.logoutBtn} onPress={() => { playSound('pop'); setUserRole('viewer'); }}>
          <Text style={styles.logoutText}>Salir a vista general</Text>
        </Pressable>
      </View>

      {/* RECYCLE */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>⚖️ Registro de Reciclaje</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={gradeRecycle}
            onValueChange={setGradeRecycle}
            style={{ color: theme.text, height: 50 }}
          >
            {grados.map((g) => (
              <Picker.Item key={g} label={`Grado ${g}`} value={g} />
            ))}
          </Picker>
        </View>
        <TextInput
          style={[sharedStyles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
          placeholder="Kilos de papel/plástico"
          placeholderTextColor={theme.subtle}
          keyboardType="numeric"
          value={paperKg}
          onChangeText={setPaperKg}
        />
        <Pressable style={[sharedStyles.buttonBase, { backgroundColor: theme.primary }]} onPress={registerRecycle}>
          <Text style={styles.btnText}>Registrar Peso</Text>
        </Pressable>
      </View>

      {/* NOTICE */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>📢 Publicar Aviso / Noticia</Text>
        <TextInput
          style={[sharedStyles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
          placeholder="Título..."
          placeholderTextColor={theme.subtle}
          value={noticeTitle}
          onChangeText={setNoticeTitle}
        />
        <TextInput
          style={[sharedStyles.input, styles.inputLarge, { backgroundColor: theme.inputBg, color: theme.text }]}
          placeholder="Contenido..."
          placeholderTextColor={theme.subtle}
          multiline
          value={noticeBody}
          onChangeText={setNoticeBody}
        />
        <Pressable style={[sharedStyles.buttonBase, { backgroundColor: theme.accent }]} onPress={publishNotice}>
          <Text style={styles.btnText}>Subir Comunicado</Text>
        </Pressable>
      </View>

      {/* GLOBAL CHALLENGE */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>🎯 Crear Nuevo Reto Global</Text>
        <View style={styles.row}>
          <TextInput
            style={[sharedStyles.input, styles.flexTwo, { backgroundColor: theme.inputBg, color: theme.text }]}
            placeholder="Reto..."
            placeholderTextColor={theme.subtle}
            value={globalTitle}
            onChangeText={setGlobalTitle}
          />
          <TextInput
            style={[sharedStyles.input, styles.flexOne, styles.marginLeft, { backgroundColor: theme.inputBg, color: theme.text }]}
            placeholder="Pts"
            placeholderTextColor={theme.subtle}
            keyboardType="numeric"
            value={globalPoints}
            onChangeText={setGlobalPoints}
          />
        </View>
        <Pressable style={[sharedStyles.buttonBase, { backgroundColor: theme.primary }]} onPress={createGlobalChallenge}>
          <Text style={styles.btnText}>Inyectar Reto</Text>
        </Pressable>
      </View>

      {/* EXPORT PDF */}
      <View style={[styles.card, styles.bottomMargin]}>
        <Text style={styles.sectionLabel}>📄 Exportar Métricas de Firebase</Text>
        <Pressable style={[sharedStyles.buttonBase, { backgroundColor: theme.danger }]} onPress={exportPDF}>
          <Text style={styles.btnText}>Generar PDF Oficial</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  block: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  blockTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  blockSub: { color: '#8e8e93', fontSize: 14, marginBottom: 25, textAlign: 'center' },
  btn: { padding: 12, borderRadius: 8, width: '100%', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#ff3b30', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  card: { padding: 18, borderRadius: 14, marginBottom: 16, borderWidth: 1 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#8e8e93', marginBottom: 12 },
  pickerWrap: { borderWidth: 1, borderRadius: 8, borderColor: '#ccc', marginBottom: 10 },
  inputLarge: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', marginBottom: 12 },
  flexOne: { flex: 1 },
  flexTwo: { flex: 2 },
  marginLeft: { marginLeft: 10 },
  bottomMargin: { marginBottom: 40 },
});