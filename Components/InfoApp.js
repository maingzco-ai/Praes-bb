import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView } from 'react-native';
import { getTheme, shadows, borderRadius, spacing } from '../theme';

function InfoBox({ theme, title, body, accent, isGreen }) {
  const bgColor = isGreen ? theme.primary : theme.card;
  const textColor = isGreen ? '#fff' : theme.text;
  const titleColor = isGreen ? '#fff' : (accent || theme.primary);

  return (
    <View style={[styles.box, { backgroundColor: bgColor, borderColor: isGreen ? 'transparent' : theme.border }, !isGreen && shadows.sm]}>
      <View style={[styles.boxAccent, { backgroundColor: titleColor }]} />
      <Text style={[styles.boxTitle, { color: titleColor }]}>{title}</Text>
      <Text style={[styles.boxBody, { color: textColor }]}>{body}</Text>
    </View>
  );
}

export default function InfoApp({ isDark }) {
  const theme = getTheme(isDark);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: 'transparent' }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.center}>
        <Image source={require('../assets/praes.png')} style={styles.logo} />
        <Text style={[styles.title, { color: theme.text }]}>Portal PRAES</Text>
        <Text style={[styles.subtitle, { color: theme.subtle }]}>Colombo Francés</Text>
      </View>

      <InfoBox
        theme={theme}
        title="¿Qué es?"
        body="El Proyecto Ambiental Escolar es el compromiso para hacer del colegio un lugar sostenible y cuidar el medio ambiente."
        accent={theme.primary}
      />

      <InfoBox
        theme={theme}
        title="Reciclaje"
        body="Cada residuo que separas de forma correcta suma puntos para el ranking de tu curso en el colegio."
        accent={theme.accent}
      />

      <InfoBox
        theme={theme}
        title="Innovación"
        body="Cambiamos el papel y el lápiz por una aplicación móvil para controlar nuestro impacto ambiental con tecnología."
        isGreen
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  content: {
    paddingBottom: 8,
  },
  center: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 10,
    borderRadius: borderRadius.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  box: {
    marginHorizontal: 4,
    marginVertical: 8,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  boxAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    borderTopLeftRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.lg,
  },
  boxTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    marginLeft: 8,
  },
  boxBody: {
    fontSize: 14,
    lineHeight: 21,
    marginLeft: 8,
    opacity: 0.9,
  },
});
