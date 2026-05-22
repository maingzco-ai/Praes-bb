import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { database } from '../firebase.js';
import { ref, onValue } from 'firebase/database';

export default function Avisos({ Oscuro }) {
  const [avisos, setAvisos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fondo = Oscuro ? '#1c1c1e' : '#ffffff';
  const texto = Oscuro ? '#ffffff' : '#1c1c1e';
  const textoSec = Oscuro ? '#a0a0a0' : '#8e8e93';
  const tarjetaFondo = Oscuro ? '#2c2c2e' : '#ffffff';
  const borde = Oscuro ? '#3a3a3c' : '#f2f2f7';

  useEffect(() => {
    const avisosRef = ref(database, '/Avisos');
    const unsub = onValue(avisosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        lista.reverse();
        setAvisos(lista);
      } else {
        setAvisos([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <View style={[styles.centro, { backgroundColor: fondo }]}>
        <ActivityIndicator size="small" color="#007aff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: fondo }]}>
      <Text style={[styles.titulo, { color: texto }]}>Avisos</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {avisos.length === 0 ? (
          <Text style={[styles.vacio, { color: textoSec }]}>No hay avisos por ahora.</Text>
        ) : (
          avisos.map((aviso) => (
            <View key={aviso.id} style={[styles.tarjeta, { backgroundColor: tarjetaFondo, borderColor: borde }]}>
              <Text style={[styles.avisoTitulo, { color: texto }]}>{aviso.title || aviso.titulo}</Text>
              <Text style={[styles.avisoContenido, { color: textoSec }]}>{aviso.content || aviso.contenido}</Text>
              <Text style={[styles.avisoMeta, { color: textoSec }]}>
                {aviso.author || aviso.autor} • {aviso.date || aviso.fecha}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 26, fontWeight: '700', marginBottom: 20 },
  vacio: { textAlign: 'center', fontSize: 14, marginTop: 40 },
  tarjeta: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  avisoTitulo: { fontSize: 17, fontWeight: '600', marginBottom: 6 },
  avisoContenido: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  avisoMeta: { fontSize: 11, fontWeight: '500' },
});
