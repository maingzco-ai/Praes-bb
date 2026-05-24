import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { database } from '../firebase'; 
import { ref, onValue, update } from 'firebase/database';

export default function Retos({ Oscuro, userRole }) {
  const fondo = Oscuro ? '#1c1c1e' : '#f2f2f7';
  const texto = Oscuro ? '#ffffff' : '#1c1c1e';
  const tarjetaBg = Oscuro ? '#2c2c2e' : '#ffffff';

  const [retos, setRetos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('Primero');
  const [cargando, setCargando] = useState(true);

  const grados = ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto', 'Septimo', 'Octavo', 'Noveno', 'Decimo', 'Once'];

  useEffect(() => {
    setCargando(true);
    const retosRef = ref(database, `retos/${cursoSeleccionado}`);
    
    const unsubscribe = onValue(retosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRetos(Object.keys(data).map(k => ({ id: k, ...data[k] })));
        setCargando(false);
      } else {
        // SI ESTÁ VACÍO: Auto-inyecta los 6 retos de prueba automáticamente
        inyectarRetosAutomaticos();
      }
    });
    return () => unsubscribe();
  }, [cursoSeleccionado]);

  const inyectarRetosAutomaticos = async () => {
    const retosEjemplo = [
      { tit: "Traer 15 botellas plásticas limpias", pts: 10 },
      { tit: "Apagar luces y ventiladores al salir", pts: 5 },
      { tit: "Separar residuos orgánicos del descanso", pts: 15 },
      { tit: "Mantener la zona verde del curso limpia", pts: 20 },
      { tit: "Crear cartelera sobre fauna local", pts: 25 },
      { tit: "Sembrar una planta en el colegio", pts: 30 }
    ];
    const paquete = {};
    grados.forEach(g => {
      retosEjemplo.forEach((reto, i) => {
        paquete[`retos/${g}/reto_auto_${i}`] = { titulo: reto.tit, puntos: reto.pts, completado: false };
      });
    });
    await update(ref(database), paquete);
  };

  const alternar = async (id, estado) => {
    if (userRole !== 'admin') return;
    await update(ref(database, `retos/${cursoSeleccionado}/${id}`), { completado: !estado });
  };

  return (
    <View style={[styles.base, { backgroundColor: fondo }]}>
      <View style={[styles.caja, { backgroundColor: tarjetaBg }]}>
        <Text style={styles.lblGris}>Filtrar grado:</Text>
        <View style={styles.bordeGris}>
          <Picker selectedValue={cursoSeleccionado} onValueChange={setCursoSeleccionado} style={{ color: texto, height: 50 }}>
            {grados.map(g => <Picker.Item key={g} label={`Grado ${g}`} value={g} />)}
          </Picker>
        </View>
      </View>

      {cargando ? <ActivityIndicator size="large" color="#34C759" /> : (
        <FlatList
          data={retos}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.tarjeta, { backgroundColor: tarjetaBg }, item.completado && styles.bordeOk]}>
              <View style={styles.info}>
                <Text style={[styles.tit, { color: texto }]}>{item.titulo}</Text>
                <Text style={styles.pts}>+{item.puntos} Pts</Text>
              </View>
              {userRole === 'admin' ? (
                <TouchableOpacity style={[styles.btnAccion, item.completado ? styles.bgRojo : styles.bgVerde]} onPress={() => alternar(item.id, item.completado)}>
                  <Text style={styles.txtBlanco}>{item.completado ? 'Deshacer' : 'Completar'}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={item.completado ? styles.lblVerde : styles.lblGris}>
                  {item.completado ? '✅ Logrado' : '⏳ Pendiente'}
                </Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    padding: 12,
  },
  caja: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  bordeGris: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  tarjeta: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  bordeOk: {
    borderColor: '#34c759',
  },
  info: {
    flex: 1,
  },
  tit: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pts: {
    color: '#ff9500',
    fontWeight: 'bold',
  },
  btnAccion: {
    padding: 10,
    borderRadius: 8,
  },
  bgVerde: {
    backgroundColor: '#34c759',
  },
  bgRojo: {
    backgroundColor: '#ff3b30',
  },
  txtBlanco: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  lblVerde: {
    color: '#34c759',
    fontWeight: 'bold',
  },
  lblGris: {
    color: '#8e8e93',
    fontWeight: 'bold',
    marginBottom: 5,
  },
});