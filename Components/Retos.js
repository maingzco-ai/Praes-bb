import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { database } from '../firebase';
import { ref, onValue, update, get } from 'firebase/database';
import { getTheme, sharedStyles } from '../theme';

export default function Retos({ isDark, userRole }) {
  const [retos, setRetos] = useState([]);
  const [grado, setGrado] = useState('Primero');
  const [loading, setLoading] = useState(true);
  const theme = getTheme(isDark);

  const grados = [
    'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto',
    'Sexto', 'Septimo', 'Octavo', 'Noveno', 'Decimo', 'Once',
  ];

  useEffect(() => {
    setLoading(true);
    const retosRef = ref(database, `retos/${grado}`);
    const unsub = onValue(retosRef, (snap) => {
      const data = snap.val();
      if (data) {
        setRetos(Object.entries(data).map(([id, val]) => ({ id, ...val })));
        setLoading(false);
      } else {
        injectDemoChallenges();
      }
    });
    return () => unsub();
  }, [grado]);

  const injectDemoChallenges = async () => {
    const demo = [
      { titulo: 'Traer 15 botellas plásticas limpias', puntos: 10 },
      { titulo: 'Apagar luces y ventiladores al salir', puntos: 5 },
      { titulo: 'Separar residuos orgánicos del descanso', puntos: 15 },
      { titulo: 'Mantener la zona verde del curso limpia', puntos: 20 },
      { titulo: 'Crear cartelera sobre fauna local', puntos: 25 },
      { titulo: 'Sembrar una planta en el colegio', puntos: 30 },
    ];
    const batch = {};
    grados.forEach((g) => {
      demo.forEach((r, i) => {
        batch[`retos/${g}/reto_auto_${i}`] = { titulo: r.titulo, puntos: r.puntos, completado: false };
      });
    });
    await update(ref(database), batch);
  };

  // Suma o resta puntos al score del grado y agrega/elimina registro en historial
  const toggleComplete = async (item) => {
    if (userRole !== 'admin') return;

    const nuevaCompletado = !item.completado;
    const cambio = nuevaCompletado ? item.puntos : -item.puntos;

    try {
      // Leer datos actuales del grado
      const snap = await get(ref(database, 'Grados'));
      const data = snap.val();
      if (!data) return;

      const index = data.findIndex((g) => g?.name === grado);
      if (index === -1) {
        Alert.alert('Error', `No se encontró el grado "${grado}" en la base de datos.`);
        return;
      }

      const scoreActual = data[index].score || 0;
      const historialKey = `reto_${item.id}`;
      const updates = {};

      // Actualizar estado del reto
      updates[`retos/${grado}/${item.id}/completado`] = nuevaCompletado;

      // Actualizar score del grado
      updates[`Grados/${index}/score`] = scoreActual + cambio;

      if (nuevaCompletado) {
        // Agregar registro en historial
        updates[`Grados/${index}/history/${historialKey}`] = {
          Puntos: item.puntos,
          tipo: 'Reto',
          descripcion: item.titulo,
          fecha: new Date().toLocaleDateString('es-CO'),
          admin: 'Docente PRAES',
        };
      } else {
        // Quitar registro del historial al deshacer
        updates[`Grados/${index}/history/${historialKey}`] = null;
        // Agregar registro negativo para auditoria
        updates[`Grados/${index}/history/deshacer_${item.id}_${Date.now()}`] = {
          Puntos: -item.puntos,
          tipo: 'Reto (Deshecho)',
          descripcion: item.titulo,
          fecha: new Date().toLocaleDateString('es-CO'),
          admin: 'Docente PRAES',
        };
      }

      await update(ref(database), updates);

      Alert.alert(
        nuevaCompletado ? '✅ Reto Completado' : '↩️ Reto Deshecho',
        `${nuevaCompletado ? '+' : ''}${cambio} pts para Grado ${grado}`
      );
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo actualizar el puntaje.');
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        sharedStyles.card,
        { backgroundColor: theme.card, borderColor: item.completado ? theme.primary : theme.border },
      ]}
    >
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]}>{item.titulo}</Text>
        <Text style={[styles.points, { color: item.completado ? theme.primary : '#ff9500' }]}>
          {item.completado ? '✅' : '🎯'} {item.puntos} pts
        </Text>
      </View>
      {userRole === 'admin' ? (
        <Pressable
          style={[styles.actionBtn, { backgroundColor: item.completado ? theme.danger : theme.primary }]}
          onPress={() => toggleComplete(item)}
        >
          <Text style={styles.actionText}>{item.completado ? '↩️ Deshacer' : '✓ Completar'}</Text>
        </Pressable>
      ) : (
        <Text style={{ color: item.completado ? theme.primary : theme.subtle, fontSize: 13 }}>
          {item.completado ? '✅ Logrado' : '⏳ Pendiente'}
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.filterBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.filterLabel, { color: theme.text }]}>Filtrar grado:</Text>
        <View style={[styles.pickerWrap, { borderColor: theme.border }]}>
          <Picker
            selectedValue={grado}
            onValueChange={setGrado}
            style={{ color: theme.text, height: 50 }}
          >
            {grados.map((g) => (
              <Picker.Item key={g} label={`Grado ${g}`} value={g} />
            ))}
          </Picker>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} />
      ) : (
        <FlatList
          data={retos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  filterBox: { padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1 },
  filterLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  pickerWrap: { borderWidth: 1, borderRadius: 8 },
  info: { flex: 1, marginBottom: 10 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  points: { fontWeight: 'bold', fontSize: 14 },
  actionBtn: { padding: 10, borderRadius: 8, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});