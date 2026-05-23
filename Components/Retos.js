import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

import { database } from '../firebase'; 
import { ref, onValue, update } from 'firebase/database';

export default function Retos({ Oscuro, userRole }) {
  // Configuración dinámica de tema
  const fondo = Oscuro ? '#1c1c1e' : '#f2f2f7';
  const texto = Oscuro ? '#ffffff' : '#1c1c1e';
  const tarjetaFondo = Oscuro ? '#2c2c2e' : '#ffffff';
  const borde = Oscuro ? '#3a3a3c' : '#e0e0e0';

  const [retos, setRetos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState('Sexto');
  const [cargando, setCargando] = useState(true);

  // CONEXIÓN A FIREBASE REALTIME DATABASE
  useEffect(() => {
    setCargando(true);
    // Apuntamos exactamente a la rama del curso seleccionado (Ej: retos/Sexto)
    const retosRef = ref(database, `retos/${cursoSeleccionado}`);

    // onValue escucha en tiempo real cualquier cambio en esa rama
    const unsubscribe = onValue(retosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Transformamos el objeto JSON de Firebase en un Array para React Native
        const listaRetos = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setRetos(listaRetos);
      } else {
        setRetos([]); // Si no hay datos, vaciamos la lista
      }
      setCargando(false);
    });

    return () => unsubscribe(); // Limpieza de memoria
  }, [cursoSeleccionado]);

  // FUNCIÓN DE ADMINISTRADOR: Marcar como completado/pendiente
  const alternarCompletado = async (idReto, estadoActual) => {
    if (userRole !== 'admin') return;

    try {
      // Apuntamos al reto específico en la base de datos
      const retoRef = ref(database, `retos/${cursoSeleccionado}/${idReto}`);
      
      // Actualizamos solo el campo 'completado'
      await update(retoRef, {
        completado: !estadoActual
      });
    } catch (error) {
      console.error("Error al actualizar estado: ", error);
    }
  };

  return (
    <SafeAreaView style={[styles.contenedor, { backgroundColor: fondo }]}>
      
      {/* 1. SECTOR DEL DESPLEGABLE DE CURSOS */}
      <View style={[styles.selectorCaja, { backgroundColor: tarjetaFondo, borderColor: borde }]}>
        <Text style={styles.selectorLabel}>Filtrar retos por curso:</Text>
        <View style={[styles.pickerBorde, { borderColor: borde }]}>
          <Picker
            selectedValue={cursoSeleccionado}
            onValueChange={(itemValue) => setCursoSeleccionado(itemValue)}
            style={{ color: texto, height: 50 }}
            dropdownIconColor={texto}
          >
            <Picker.Item label="Grado Sexto" value="Sexto" />
            <Picker.Item label="Grado Séptimo" value="Septimo" />
            <Picker.Item label="Grado Octavo" value="Octavo" />
            <Picker.Item label="Grado Noveno" value="Noveno" />
            <Picker.Item label="Grado Décimo" value="Decimo" />
            <Picker.Item label="Grado Once" value="Once" />
          </Picker>
        </View>
      </View>

      {/* 2. ZONA DE CARGA */}
      {cargando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color="#2ea44f" />
        </View>
      ) : (
        
        /* 3. LISTA DE RETOS DINÁMICA */
        <FlatList
          data={retos}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[
              styles.tarjeta, 
              { backgroundColor: tarjetaFondo, borderColor: borde },
              item.completado && styles.tarjetaLograda 
            ]}>
              
              <View style={styles.infoBloque}>
                <Text style={[styles.tituloReto, { color: texto }]}>{item.titulo}</Text>
                <Text style={styles.puntosReto}>+{item.puntos} Puntos PRAES</Text>
              </View>

              {userRole === 'admin' ? (
                <TouchableOpacity 
                  style={[styles.botonAdmin, item.completado ? styles.botonRojo : styles.botonVerde]}
                  onPress={() => alternarCompletado(item.id, item.completado)}
                >
                  <Text style={styles.textoBoton}>
                    {item.completado ? 'Deshacer' : 'Completar'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.indicador, item.completado ? styles.indicadorLogrado : styles.indicadorPendiente]}>
                  <Text style={[styles.textoIndicador, item.completado ? { color: '#fff' } : { color: '#000' }]}>
                    {item.completado ? 'Logrado' : 'Pendiente'}
                  </Text>
                </View>
              )}

            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.textoVacio}>No hay retos configurados para este grado.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

// --------------------------------------------------------------------
// HOJA DE ESTILOS ESTRUCTURADA Y LIMPIA
// --------------------------------------------------------------------
const styles = StyleSheet.create({
  /* CONTENEDORES PRINCIPALES */
  contenedor: {
    flex: 1,
    paddingHorizontal: 15,
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ZONA DE SELECTOR (PICKER) */
  selectorCaja: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
    elevation: 2,
    marginTop: 10,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8e8e93',
    marginBottom: 8,
  },
  pickerBorde: {
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },

  /* TARJETAS DE RETOS */
  tarjeta: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
  },
  tarjetaLograda: {
    borderColor: '#34c759',
    borderWidth: 2,
  },
  infoBloque: {
    flex: 1,
    paddingRight: 15,
  },

  /* TIPOGRAFÍA DE RETOS */
  tituloReto: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  puntosReto: {
    fontSize: 14,
    color: '#ff9500',
    fontWeight: 'bold',
  },
  textoVacio: {
    textAlign: 'center',
    color: '#8e8e93',
    marginTop: 40,
    fontStyle: 'italic',
  },

  /* BOTONES (MODO ADMIN) */
  botonAdmin: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  botonVerde: {
    backgroundColor: '#34c759',
  },
  botonRojo: {
    backgroundColor: '#ff3b30',
  },
  textoBoton: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },

  /* INDICADORES (MODO VIEWER) */
  indicador: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  indicadorLogrado: {
    backgroundColor: '#34c759',
    borderColor: '#34c759',
  },
  indicadorPendiente: {
    backgroundColor: 'transparent',
    borderColor: '#8e8e93',
  },
  textoIndicador: {
    fontWeight: 'bold',
    fontSize: 12,
  }
});