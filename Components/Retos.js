import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { database } from '../firebase';
import { ref, onValue, update, get } from 'firebase/database';
import { getTheme, shadows, borderRadius, spacing } from '../theme';

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

  const toggleComplete = async (item) => {
    if (userRole !== 'admin') return;

    const nuevaCompletado = !item.completado;
    const cambio = nuevaCompletado ? item.puntos : -item.puntos;

    try {
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

      updates[`retos/${grado}/${item.id}/completado`] = nuevaCompletado;
      updates[`Grados/${index}/score`] = scoreActual + cambio;

      if (nuevaCompletado) {
        updates[`Grados/${index}/history/${historialKey}`] = {
          Puntos: item.puntos,
          tipo: 'Reto',
          descripcion: item.titulo,
          fecha: new Date().toLocaleDateString('es-CO'),
          admin: 'Docente PRAES',
        };
      } else {
        updates[`Grados/${index}/history/${historialKey}`] = null;
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
        nuevaCompletado ? 'Reto Completado' : 'Reto Deshecho',
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
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: item.completado ? theme.primary : theme.border,
        },
        shadows.sm,
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardLeft}>
          <View style={[styles.iconCircle, {
            backgroundColor: item.completado ? theme.primaryLight : theme.warningLight,
          }]}>
            <Text style={styles.iconText}>
              {item.completado ? '✅' : '🎯'}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.title, { color: theme.text }]}>{item.titulo}</Text>
            <Text style={[styles.points, { color: item.completado ? theme.primary : theme.warning }]}>
              {item.puntos} pts
            </Text>
          </View>
        </View>
        {userRole === 'admin' ? (
          <Pressable
            style={[styles.actionBtn, {
              backgroundColor: item.completado ? theme.danger : theme.primary,
            }]}
            onPress={() => toggleComplete(item)}
          >
            <Text style={styles.actionText}>
              {item.completado ? 'Deshacer' : 'Completar'}
            </Text>
          </Pressable>
        ) : (
          <View style={[styles.statusBadge, {
            backgroundColor: item.completado ? theme.primaryLight : theme.backgroundAlt,
          }]}>
            <Text style={[styles.statusText, {
              color: item.completado ? theme.primary : theme.subtle,
            }]}>
              {item.completado ? 'Logrado' : 'Pendiente'}
            </Text>
          </View>
        )}
      </View>
      {item.completado && (
        <View style={[styles.completedBar, { backgroundColor: theme.primary }]} />
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerSection}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Retos</Text>
        <Text style={[styles.screenSubtitle, { color: theme.subtle }]}>
          Desafíos ambientales por grado
        </Text>
      </View>

      <View style={[styles.filterBox, { backgroundColor: theme.card, borderColor: theme.border }, shadows.sm]}>
        <View style={styles.filterLabelRow}>
          <Text style={styles.filterIcon}>🎯</Text>
          <Text style={[styles.filterLabel, { color: theme.text }]}>Filtrar por grado</Text>
        </View>
        <View style={[styles.pickerWrap, { borderColor: theme.border, backgroundColor: theme.inputBg }]}>
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
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={retos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.subtle }]}>
              No hay retos disponibles
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  filterBox: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  filterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  filterIcon: {
    fontSize: 16,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  pickerWrap: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 30,
  },
  card: {
    borderRadius: borderRadius.lg,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  cardInfo: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  points: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: borderRadius.sm,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completedBar: {
    height: 3,
    width: '100%',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
});
