import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { database } from '../firebase.js';
import { ref, onValue } from 'firebase/database';

export default function Retos({ Oscuro }) {
  const [retos, setRetos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fondo = Oscuro ? '#1c1c1e' : '#ffffff';
  const texto = Oscuro ? '#ffffff' : '#1c1c1e';
  const textoSec = Oscuro ? '#a0a0a0' : '#8e8e93';
  const tarjetaFondo = Oscuro ? '#2c2c2e' : '#ffffff';
  const borde = Oscuro ? '#3a3a3c' : '#f2f2f7';
  const acento = '#34c759';

  useEffect(() => {
    const retosRef = ref(database, '/Retos');
    const unsub = onValue(retosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        lista.reverse();
        setRetos(lista);
      } else {
        setRetos([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <View style={[styles.centro, { backgroundColor: fondo }]}>
        <ActivityIndicator size="small" color="#34c759" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: fondo }]}>
      <Text style={[styles.titulo, { color: texto }]}>Retos</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {retos.length === 0 ? (
          <Text style={[styles.vacio, { color: textoSec }]}>No hay retos activos.</Text>
        ) : (
          retos.map((reto) => (
            <View key={reto.id} style={[styles.tarjeta, { backgroundColor: tarjetaFondo, borderColor: borde }]}>
              <View style={styles.header}>
                <Text style={[styles.retoTitulo, { color: texto }]}>{reto.title || reto.titulo}</Text>
                <Text style={[styles.puntos, { color: acento }]}>
                  +{reto.points || reto.puntos || 0} pts
                </Text>
              </View>
              <Text style={[styles.retoDesc, { color: textoSec }]}>{reto.description || reto.descripcion}</Text>
              <Text style={[styles.retoMeta, { color: textoSec }]}>
                {reto.author || reto.autor} • {reto.date || reto.fecha}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  retoTitulo: { fontSize: 17, fontWeight: '600', flex: 1 },
  puntos: { fontSize: 15, fontWeight: '700', marginLeft: 8 },
  retoDesc: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  retoMeta: { fontSize: 11, fontWeight: '500' },
});
