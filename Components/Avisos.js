import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { getTheme, shadows, borderRadius, spacing } from '../theme';

function AvisoCard({ item, theme }) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        shadows.md,
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.tagBadge, { backgroundColor: theme.accentLight }]}>
          <Text style={[styles.tag, { color: theme.accent }]}>COMUNICADO</Text>
        </View>
        <Text style={[styles.date, { color: theme.subtle }]}>{item.fecha}</Text>
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{item.titulo}</Text>
      <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />
      <Text style={[styles.body, { color: theme.textSecondary }]}>{item.contenido}</Text>
    </View>
  );
}

export default function Avisos({ isDark }) {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = getTheme(isDark);

  useEffect(() => {
    const avisosRef = ref(database, 'avisos/');
    const unsub = onValue(avisosRef, (snap) => {
      const data = snap.val();
      const list = data
        ? Object.entries(data)
            .map(([id, val]) => ({ id, ...val }))
            .reverse()
        : [];
      setAvisos(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerSection}>
        <Text style={[styles.screenTitle, { color: theme.text }]}>Avisos</Text>
        <Text style={[styles.screenSubtitle, { color: theme.subtle }]}>
          Comunicados oficiales del PRAES
        </Text>
      </View>
      <FlatList
        data={avisos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AvisoCard item={item} theme={theme} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📢</Text>
            <Text style={[styles.empty, { color: theme.subtle }]}>
              No hay avisos publicados aún
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 30,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  tag: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 11,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  divider: {
    height: 1,
    marginBottom: spacing.md,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 40,
  },
  empty: {
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 14,
  },
});
