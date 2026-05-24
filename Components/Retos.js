import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from 'react-native';
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
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevosPuntos, setNuevosPuntos] = useState('');

  const grados = ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto', 'Septimo', 'Octavo', 'Noveno', 'Decimo', 'Once'];

  useEffect(() => {
    setCargando(true);
    const unsubscribe = onValue(ref(database, `retos/${cursoSeleccionado}`), (snapshot) => {
      const data = snapshot.val();
      setRetos(data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : []);
      setCargando(false);
    });
    return () => unsubscribe();
  }, [cursoSeleccionado]);

  const alternar = async (id, estado) => {
    if (userRole !== 'admin') return;
    await update(ref(database, `retos/${cursoSeleccionado}/${id}`), { completado: !estado });
  };

  const crearRetoGlobal = async () => {
    if (!nuevoTitulo || !nuevosPuntos) return;
    const paquete = {};
    const idUnico = 'reto_' + Date.now();
    
    grados.forEach(g => {
      paquete[`retos/${g}/${idUnico}`] = { 
        titulo: nuevoTitulo, 
        puntos: parseInt(nuevosPuntos) || 0, 
        completado: false 
      };
    });

    await update(ref(database), paquete);
    setNuevoTitulo('');
    setNuevosPuntos('');
  };

  // FUNCIÓN DE SIEMBRA (SEEDING): Crea 6 retos estructurados de golpe
  const generarRetosDePrueba = async () => {
    const retosEjemplo = [
      { tit: "Traer 15 botellas plásticas limpias", pts: 10 },
      { tit: "Apagar luces y ventiladores al salir", pts: 5 },
      { tit: "Separar residuos orgánicos del descanso", pts: 15 },
      { tit: "Mantener la zona verde del curso limpia", pts: 20 },
      { tit: "Crear cartelera sobre fauna local", pts: 25 },
      { tit: "Sembrar una planta en el colegio", pts: 30 }
    ];

    const paquete = {};
    const tiempoBase = Date.now();

    grados.forEach(g => {
      retosEjemplo.forEach((reto, index) => {
        // Creamos IDs únicos pero consistentes
        const idUnico = `reto_base_${tiempoBase}_${index}`;
        paquete[`retos/${g}/${idUnico}`] = {
          titulo: reto.tit,
          puntos: reto.pts,
          completado: false
        };
      });
    });

    await update(ref(database), paquete);
    alert('¡6 retos creados en todos los grados!');
  };

  return (
    <View style={[styles.base, { backgroundColor: fondo }]}>
      
      {userRole === 'admin' && (
        <View style={[styles.caja, { borderColor: '#34c759' }]}>
          <Text style={styles.lblVerde}>Panel de Control Docente</Text>
          <View style={styles.fila}>
            <TextInput style={[styles.input, { flex: 2 }]} placeholder="Título..." value={nuevoTitulo} onChangeText={setNuevoTitulo} />
            <TextInput style={[styles.input, { flex: 1, marginLeft: 10 }]} placeholder="Pts" keyboardType="numeric" value={nuevosPuntos} onChangeText={setNuevosPuntos} />
          </View>
          <TouchableOpacity style={styles.btnVerde} onPress={crearRetoGlobal}>
            <Text style={styles.txtBlanco}>Inyectar reto personalizado</Text>
          </TouchableOpacity>
          
          {/* BOTÓN TEMPORAL DE SIEMBRA */}
          <TouchableOpacity style={styles.btnAmarillo} onPress={generarRetosDePrueba}>
            <Text style={styles.txtOscuro}>Cargar 6 Retos de Prueba</Text>
          </TouchableOpacity>
        </View>
      )}

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
          ListEmptyComponent={<Text style={styles.vacio}>Aún no hay retos.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { 
    flex: 1, 
    padding: 12 
  },
  caja: { 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#e0e0e0' 
  },
  fila: { 
    flexDirection: 'row', 
    marginBottom: 10 
  },
  input: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8, 
    padding: 10 
  },
  bordeGris: { 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 8 
  },
  tarjeta: { 
    flexDirection: 'row', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'transparent' 
  },
  bordeOk: { 
    borderColor: '#34c759' 
  },
  info: { 
    flex: 1 
  },
  tit: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 4 
  },
  pts: { 
    color: '#ff9500', 
    fontWeight: 'bold' 
  },
  btnVerde: { 
    backgroundColor: '#34c759', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  btnAmarillo: {
    backgroundColor: '#ffcc00',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  btnAccion: { 
    padding: 10, 
    borderRadius: 8 
  },
  bgVerde: { 
    backgroundColor: '#34c759' 
  },
  bgRojo: { 
    backgroundColor: '#ff3b30' 
  },
  txtBlanco: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 13 
  },
  txtOscuro: {
    color: '#1c1c1e',
    fontWeight: 'bold',
    fontSize: 13
  },
  lblVerde: { 
    color: '#34c759', 
    fontWeight: 'bold', 
    marginBottom: 5 
  },
  lblGris: { 
    color: '#8e8e93', 
    fontWeight: 'bold', 
    marginBottom: 5 
  },
  vacio: { 
    textAlign: 'center', 
    color: '#8e8e93', 
    marginTop: 20 
  }
});