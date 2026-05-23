import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { ref, onValue, push, serverTimestamp } from 'firebase/database'; // Importamos funciones de Realtime
import { database } from '../firebase'; // IMPORTANTE: Asegúrate de que esta ruta sea correcta

export default function Avisos({ Oscuro, userRole }) {
  const [avisos, setAvisos] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [cargando, setCargando] = useState(true);

  // Colores para el tema
  const fondo = Oscuro ? '#1c1c1e' : '#f2f2f7';
  const texto = Oscuro ? '#ffffff' : '#1c1c1e';

  // 1. Conexión Realtime
  useEffect(() => {
    const avisosRef = ref(database, 'avisos/');
    
    const unsubscribe = onValue(avisosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        // Ordenamos para que el más nuevo salga primero
        setAvisos(lista.reverse());
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Publicar Aviso (Realtime)
  const publicarAviso = () => {
    if (!titulo || !contenido) return;

    const avisosRef = ref(database, 'avisos/');
    push(avisosRef, {
      titulo,
      contenido,
      fecha: new Date().toLocaleDateString(),
    });
    setTitulo('');
    setContenido('');
  };

  if (cargando) return <ActivityIndicator size="large" color="#2ea44f" />;

  return (
    <View style={[styles.contenedor, { backgroundColor: fondo }]}>
      {userRole === 'admin' && (
        <View style={styles.tarjetaAdmin}>
          <TextInput style={styles.input} placeholder="Título" value={titulo} onChangeText={setTitulo} />
          <TextInput style={[styles.input, styles.inputAlto]} placeholder="Contenido" value={contenido} onChangeText={setContenido} multiline />
          <TouchableOpacity style={styles.boton} onPress={publicarAviso}>
            <Text style={{color: '#FFF', fontWeight: 'bold'}}>Publicar</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={avisos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.aviso}>
            <Text style={[styles.titulo, { color: texto }]}>{item.titulo}</Text>
            <Text style={{ color: texto }}>{item.contenido}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 20 },
  tarjetaAdmin: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 20 },
  input: { borderBottomWidth: 1, marginBottom: 10, padding: 5 },
  inputAlto: { height: 60 },
  boton: { backgroundColor: '#34c759', padding: 10, borderRadius: 8, alignItems: 'center' },
  aviso: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 10 },
  titulo: { fontWeight: 'bold', fontSize: 16 }
});