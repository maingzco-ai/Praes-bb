import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';
import { database } from '../firebase';
import { ref, push, update, get } from 'firebase/database';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getTheme, sharedStyles } from '../theme';

export default function Admin({ isDark, userRole, setUserRole, setLoginVisible }) {
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeBody, setNoticeBody]   = useState('');
  const [gradeRecycle, setGradeRecycle] = useState('Primero');
  const [paperKg, setPaperKg]         = useState('');
  const [globalTitle, setGlobalTitle] = useState('');
  const [globalPoints, setGlobalPoints] = useState('');

  const theme = getTheme(isDark);

  const grados = [
    'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto',
    'Sexto', 'Septimo', 'Octavo', 'Noveno', 'Decimo', 'Once',
  ];

  const playSound = async (type) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        type === 'success'
          ? require('../assets/sounds/success.mp3')
          : require('../assets/sounds/pop.mp3')
      );
      await sound.playAsync();
    } catch (_) {}
  };

  // ─── Vista bloqueada si no es admin ────────────────────────────────────────
  if (userRole !== 'admin') {
    return (
      <View style={[styles.block, { backgroundColor: theme.background }]}>
        <Text style={[styles.blockTitle, { color: theme.text }]}>Área Restringida</Text>
        <Text style={[styles.blockSub, { color: theme.subtle }]}>
          Requiere autorización de Docente del PRAES.
        </Text>
        <Pressable
          style={[styles.btn, { backgroundColor: theme.danger }]}
          onPress={() => {
            playSound('pop');
            setLoginVisible(true);
          }}
        >
          <Text style={styles.btnText}>Ingresar Credenciales</Text>
        </Pressable>
      </View>
    );
  }

  // ─── Publicar aviso ─────────────────────────────────────────────────────────
  const publishNotice = async () => {
    if (!noticeTitle || !noticeBody) return;
    await push(ref(database, 'avisos/'), {
      titulo: noticeTitle,
      contenido: noticeBody,
      fecha: new Date().toLocaleDateString('es-CO'),
    });
    setNoticeTitle('');
    setNoticeBody('');
    playSound('success');
    Alert.alert('Éxito', 'Aviso publicado en el sistema.');
  };

  // ─── Registrar reciclaje ────────────────────────────────────────────────────
  const registerRecycle = async () => {
    if (!paperKg) return;
    const kilos  = parseFloat(paperKg);
    const points = kilos * 15;
    const snap   = await get(ref(database, 'Grados'));
    const data   = snap.val();
    if (data) {
      const index = data.findIndex((g) => g?.name === gradeRecycle);
      if (index !== -1) {
        const updates = {};
        updates[`Grados/${index}/score`] = (data[index].score || 0) + points;
        updates[`Grados/${index}/history/reg_${Date.now()}`] = {
          Puntos: points,
          tipo: 'Papel',
          kg: kilos,
          fecha: new Date().toLocaleDateString('es-CO'),
          admin: 'Docente PRAES',
        };
        await update(ref(database), updates);
        setPaperKg('');
        playSound('success');
        Alert.alert('Éxito', `+${points} pts asignados a ${gradeRecycle}`);
      }
    }
  };

  // ─── Crear reto global ──────────────────────────────────────────────────────
  const createGlobalChallenge = async () => {
    if (!globalTitle || !globalPoints) return;
    const batch = {};
    const id    = `reto_${Date.now()}`;
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

  // ─── Exportar PDF Premium ───────────────────────────────────────────────────
  const exportPDF = async () => {
    playSound('pop');
    try {
      const snap = await get(ref(database, 'Grados'));
      const data = snap.val();
      if (!data) {
        Alert.alert('Sin datos', 'No hay grados registrados aún.');
        return;
      }

      const sorted = data
        .filter(Boolean)
        .sort((a, b) => (b.score || 0) - (a.score || 0));

      const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
      const podiumLabels = ['🥇', '🥈', '🥉'];
      const podiumHeights = ['120px', '90px', '70px'];

      // Top 3 para el podio
      const top3 = sorted.slice(0, 3);
      // Resto para la tabla
      const resto = sorted.slice(3);

      const podioHTML = top3
        .map((g, i) => `
          <div style="
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:flex-end;
            margin: 0 10px;
          ">
            <div style="font-size:28px; margin-bottom:6px;">${podiumLabels[i]}</div>
            <div style="
              font-size:13px;
              font-weight:700;
              color:#1c1c1e;
              margin-bottom:4px;
              text-align:center;
              max-width:90px;
            ">Grado ${g.name}</div>
            <div style="
              font-size:18px;
              font-weight:800;
              color:${podiumColors[i]};
              margin-bottom:8px;
            ">${(g.score || 0).toFixed(1)} pts</div>
            <div style="
              width:90px;
              height:${podiumHeights[i]};
              background:${podiumColors[i]};
              border-radius:10px 10px 0 0;
              opacity:0.85;
            "></div>
          </div>
        `)
        .join('');

      const tablaHTML = resto.length > 0
        ? resto
            .map(
              (g, i) => `
              <tr>
                <td style="padding:10px 14px; font-weight:700; color:#8e8e93;">${i + 4}°</td>
                <td style="padding:10px 14px; font-weight:600; color:#1c1c1e;">Grado ${g.name}</td>
                <td style="padding:10px 14px; text-align:right; font-weight:700; color:#34c759;">
                  ${(g.score || 0).toFixed(1)} pts
                </td>
              </tr>`
            )
            .join('')
        : `<tr><td colspan="3" style="text-align:center; padding:20px; color:#8e8e93; font-style:italic;">
              Sin más participantes
           </td></tr>`;

      const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, 'SF Pro Display', Helvetica, Arial, sans-serif;
              background: #f2f2f7;
              padding: 40px 32px;
              color: #1c1c1e;
            }
            .header {
              border-bottom: 3px solid #34c759;
              padding-bottom: 18px;
              margin-bottom: 30px;
            }
            .header h1 {
              font-size: 26px;
              font-weight: 800;
              color: #1c1c1e;
              letter-spacing: -0.5px;
            }
            .header p.sub {
              font-size: 13px;
              color: #34c759;
              font-weight: 700;
              margin-top: 4px;
            }
            .header p.date {
              font-size: 11px;
              color: #8e8e93;
              margin-top: 3px;
            }
            .section-title {
              font-size: 16px;
              font-weight: 700;
              color: #1c1c1e;
              margin-bottom: 20px;
              letter-spacing: -0.3px;
            }
            .podium-wrap {
              background: #fff;
              border-radius: 18px;
              padding: 28px 20px 0 20px;
              margin-bottom: 28px;
              display: flex;
              justify-content: center;
              align-items: flex-end;
              min-height: 220px;
              box-shadow: 0 2px 12px rgba(0,0,0,0.07);
            }
            table {
              width: 100%;
              border-collapse: collapse;
              background: #fff;
              border-radius: 14px;
              overflow: hidden;
              box-shadow: 0 2px 12px rgba(0,0,0,0.07);
            }
            thead tr {
              background: #34c759;
            }
            thead th {
              padding: 12px 14px;
              color: #fff;
              font-size: 13px;
              font-weight: 700;
              text-align: left;
            }
            tbody tr:nth-child(even) { background: #f9f9fb; }
            tbody tr:hover { background: #f0fdf4; }
            .footer {
              margin-top: 36px;
              text-align: center;
              font-size: 10px;
              color: #8e8e93;
              border-top: 1px solid #e5e5ea;
              padding-top: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Colegio Colombo Francés</h1>
            <p class="sub">Reporte Oficial de Puntuación — Proyecto PRAES</p>
            <p class="date">Generado el: ${new Date().toLocaleDateString('es-CO', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}</p>
          </div>

          <p class="section-title">🏆 Podio de Líderes Ambientales</p>
          <div class="podium-wrap">${podioHTML}</div>

          ${resto.length > 0 ? `
            <p class="section-title" style="margin-bottom:14px;">📊 Clasificación General</p>
            <table>
              <thead>
                <tr>
                  <th>Puesto</th>
                  <th>Curso</th>
                  <th style="text-align:right;">Puntaje</th>
                </tr>
              </thead>
              <tbody>${tablaHTML}</tbody>
            </table>
          ` : ''}

          <div class="footer">
            Este documento es un reflejo fiel de las métricas almacenadas en el Portal Digital del PRAES.<br/>
            Colegio Colombo Francés · Sistema PRAES
          </div>
        </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
        win.print();
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Reporte PRAES',
        });
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo generar el reporte.');
    }
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>Centro de Comando</Text>
        <Pressable
          style={styles.logoutBtn}
          onPress={() => { playSound('pop'); setUserRole('viewer'); }}
        >
          <Text style={styles.logoutText}>Salir</Text>
        </Pressable>
      </View>

      {/* Reciclaje */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionLabel, { color: theme.subtle }]}>⚖️ Registro de Reciclaje</Text>
        <View style={[styles.pickerWrap, { borderColor: theme.border }]}>
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
          style={[sharedStyles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
          placeholder="Kilos de papel / plástico"
          placeholderTextColor={theme.subtle}
          keyboardType="numeric"
          value={paperKg}
          onChangeText={setPaperKg}
        />
        <Pressable
          style={[sharedStyles.buttonBase, { backgroundColor: theme.primary }]}
          onPress={registerRecycle}
        >
          <Text style={styles.btnText}>Registrar Peso</Text>
        </Pressable>
      </View>

      {/* Avisos */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionLabel, { color: theme.subtle }]}>📢 Publicar Aviso / Noticia</Text>
        <TextInput
          style={[sharedStyles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
          placeholder="Título..."
          placeholderTextColor={theme.subtle}
          value={noticeTitle}
          onChangeText={setNoticeTitle}
        />
        <TextInput
          style={[sharedStyles.input, styles.inputLarge, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
          placeholder="Contenido..."
          placeholderTextColor={theme.subtle}
          multiline
          value={noticeBody}
          onChangeText={setNoticeBody}
        />
        <Pressable
          style={[sharedStyles.buttonBase, { backgroundColor: theme.accent }]}
          onPress={publishNotice}
        >
          <Text style={styles.btnText}>Subir Comunicado</Text>
        </Pressable>
      </View>

      {/* Reto global */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionLabel, { color: theme.subtle }]}>🎯 Crear Nuevo Reto Global</Text>
        <View style={styles.row}>
          <TextInput
            style={[sharedStyles.input, styles.flexTwo, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
            placeholder="Reto..."
            placeholderTextColor={theme.subtle}
            value={globalTitle}
            onChangeText={setGlobalTitle}
          />
          <TextInput
            style={[sharedStyles.input, styles.flexOne, styles.marginLeft, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
            placeholder="Pts"
            placeholderTextColor={theme.subtle}
            keyboardType="numeric"
            value={globalPoints}
            onChangeText={setGlobalPoints}
          />
        </View>
        <Pressable
          style={[sharedStyles.buttonBase, { backgroundColor: theme.primary }]}
          onPress={createGlobalChallenge}
        >
          <Text style={styles.btnText}>Inyectar Reto</Text>
        </Pressable>
      </View>

      {/* Exportar PDF */}
      <View style={[styles.card, styles.lastCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionLabel, { color: theme.subtle }]}>📄 Exportar Métricas Oficiales</Text>
        <Text style={[styles.pdfDesc, { color: theme.subtle }]}>
          Genera un reporte PDF premium con podio visual y clasificación completa, directamente desde Firebase.
        </Text>
        <Pressable
          style={[sharedStyles.buttonBase, { backgroundColor: theme.danger }]}
          onPress={exportPDF}
        >
          <Text style={styles.btnText}>Generar Reporte PDF</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    paddingHorizontal: 4,
  },
  block: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  blockTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  blockSub: {
    fontSize: 14,
    marginBottom: 25,
    textAlign: 'center',
  },
  btn: {
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#ff3b30',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  lastCard: {
    marginBottom: 40,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  pickerWrap: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  inputLarge: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  flexOne: {
    flex: 1,
  },
  flexTwo: {
    flex: 2,
  },
  marginLeft: {
    marginLeft: 10,
  },
  pdfDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
});