import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Informacion() {
  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView>
        
        <View style={styles.centro}>
          <Image source={require('../assets/praes.png')} style={styles.logo} />
          <Text style={styles.titulo}>Portal PRAES</Text>
          <Text style={styles.subtituloPrincipal}>Colombo Francés</Text>
        </View>

        <View style={styles.cajaBlanca}>
          <Text style={styles.tituloVerde}>¿Qué es?</Text>
          <Text style={styles.texto}>
            El Proyecto Ambiental Escolar es el compromiso para hacer del colegio un lugar sostenible y cuidar el medio ambiente.
          </Text>
        </View>

        <View style={styles.cajaBlanca}>
          <Text style={styles.tituloVerde}>Reciclaje</Text>
          <Text style={styles.texto}>
            Cada residuo que separas de forma correcta suma puntos para el ranking de tu curso en el colegio.
          </Text>
        </View>

        <View style={styles.cajaVerde}>
          <Text style={styles.tituloBlanco}>Innovación</Text>
          <Text style={styles.textoBlanco}>
            Cambiamos el papel y el lápiz por una aplicación móvil para controlar nuestro impacto ambiental con tecnología.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    width: '100%',
    backgroundColor: '#eeeeee',
  },
  centro: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222222',
  },
  subtituloPrincipal: {
    fontSize: 14,
    color: '#777777',
  },
  cajaBlanca: {
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 10,
  },
  tituloVerde: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ea44f',
    marginBottom: 5,
  },
  texto: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  cajaVerde: {
    backgroundColor: '#2ea44f',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 10,
  },
  tituloBlanco: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  textoBlanco: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
});