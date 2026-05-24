import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { database } from '../firebase'; 
import { ref, onValue } from 'firebase/database';

export default function Avisos({ Oscuro }) {
  const [avisos, setAvisos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const fondo = Oscuro ? '#1c1c1e' : '#f2f2f7';
  const texto = Oscuro ? '#ffffff' : '#1c1c1e';
  const tarjetaBg = Oscuro ? '#2c2c2e' : '#ffffff';
  const borde = Oscuro ? '#3a3a3c' : '#e0e0e0';

  useEffect(() => {
    const avisosRef = ref(database, 'avisos/');
    const unsubscribe = onValue(avisosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setAvisos(lista.reverse());
      } else {
        setAvisos([]);
      }
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  if (cargando) {
    return (
      <View style={[styles.centro, { backgroundColor: fondo }]}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  return (
    <View style={[styles.base, { backgroundColor: fondo }]}>
      <FlatList
        data={avisos}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.tarjeta, { backgroundColor: tarjetaBg, borderColor: borde }]}>
            <Text style={styles.tag}>📢 COMUNICADO OFFICIAL</Text>
            <Text style={[styles.titulo, { color: texto }]}>{item.titulo}</Text>
            <Text style={[styles.contenido, { color: texto }]}>{item.contenido}</Text>
            <Text style={styles.fecha}>Publicado el: {item.fecha}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.vacio}>No hay avisos o noticias en el muro escolar.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    padding: 15,
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tarjeta: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 1,
  },
  tag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#007aff',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  contenido: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  fecha: {
    fontSize: 11,
    color: '#8e8e93',
  },
  vacio: {
    textAlign: 'center',
    color: '#8e8e93',
    marginTop: 40,
    fontStyle: 'italic',
  },
});