import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { getTheme, shadows, borderRadius, spacing } from '../theme';

export default function Mapa({ isDark }) {
  const theme = getTheme(isDark);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, shadows.md]}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🗺️</Text>
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Mapa Ambiental</Text>
        <Text style={[styles.description, { color: theme.subtle }]}>
          Próximamente podrás ver los puntos de reciclaje y zonas ecológicas del colegio en un mapa interactivo.
        </Text>
        <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
          <Text style={[styles.badgeText, { color: theme.primary }]}>PRÓXIMAMENTE</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
