import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView } from 'react-native';
import { getTheme } from '../theme';

export default function InfoApp({ isDark }) {
  const theme = getTheme(isDark);
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.center}>
        <Image source={require('../assets/praes.png')} style={styles.logo} />
        <Text style={[styles.title, { color: theme.text }]}>Portal PRAES</Text>
        <Text style={[styles.subtitle, { color: theme.subtle }]}>Colombo Francés</Text>
      </View>

      <View style={styles.box}>
        <Text style={[styles.boxTitle, { color: theme.primary }]}>¿Qué es?</Text>
        <Text style={[styles.boxBody, { color: theme.text }]}>El Proyecto Ambiental Escolar es el compromiso para hacer del colegio un lugar sostenible y cuidar el medio ambiente.</Text>
      </View>

      <View style={styles.box}>
        <Text style={[styles.boxTitle, { color: theme.primary }]}>Reciclaje</Text>
        <Text style={[styles.boxBody, { color: theme.text }]}>Cada residuo que separas de forma correcta suma puntos para el ranking de tu curso en el colegio.</Text>
      </View>

      <View style={[styles.box, { backgroundColor: theme.primary }]}>
        <Text style={styles.boxTitleWhite}>Innovación</Text>
        <Text style={styles.boxBodyWhite}>Cambiamos el papel y el lápiz por una aplicación móvil para controlar nuestro impacto ambiental con tecnología.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', marginVertical: 20 },
  logo: { width: 100, height: 100, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14 },
  box: { backgroundColor: theme.card, marginHorizontal: 15, marginVertical: 8, padding: 15, borderRadius: 10 },
  boxTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: theme.text },
  boxBody: { fontSize: 14, lineHeight: 20, color: theme.text },
  boxTitleWhite: { fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 5 },
  boxBodyWhite: { fontSize: 14, color: theme.text, lineHeight: 20 },
});