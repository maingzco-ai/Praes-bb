import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { database } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import { getTheme, sharedStyles } from '../theme';

export default function Retos({ isDark, userRole }) {
  const [retos, setRetos] = useState([]);
  const [grado, setGrado] = useState('Primero');
  const [loading, setLoading] = useState(true);
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

  // Load challenges for selected grade
  useEffect(() => {
    setLoading(true);
    const retosRef = ref(database, `retos/${grado}`);
    const unsub = onValue(retosRef, (snap) => {
      const data = snap.val();
      if (data) {
        setRetos(Object.entries(data).map(([id, val]) => ({ id, ...val })));
        setLoading(false);
      } else {
        // auto‑inject demo challenges if none exist
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

  const toggleComplete = async (id, current) => {
    if (userRole !== 'admin') return;
    await update(ref(database, `retos/${grado}/${id}`), { completado: !current });
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        sharedStyles.card,
        { backgroundColor: theme.card },
        item.completado && { borderColor: theme.primary },
      ]}
    >
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]}>{item.titulo}</Text>
        <Text style={styles.points}>+{item.puntos} pts</Text>
      </View>
      {userRole === 'admin' ? (
        <Pressable
          style={[styles.actionBtn, { backgroundColor: item.completado ? theme.danger : theme.primary }]}
          onPress={() => toggleComplete(item.id, item.completado)}
        >
          <Text style={styles.actionText}>{item.completado ? 'Deshacer' : 'Completar'}</Text>
        </Pressable>
      ) : (
        <Text style={{ color: item.completado ? theme.primary : theme.subtle }}>
          {item.completado ? '✅ Logrado' : '⏳ Pendiente'}
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.filterBox, { backgroundColor: theme.card }]}>
        <Text style={styles.filterLabel}>Filtrar grado:</Text>
        <View style={styles.pickerWrap}>
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
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  points: { color: '#ff9500', fontWeight: 'bold' },
  actionBtn: { padding: 10, borderRadius: 8, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});