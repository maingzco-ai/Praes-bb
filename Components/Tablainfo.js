import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Importaciones de Firebase Realtime Database
import { database } from '../firebase.js'; 
import { ref, onValue } from 'firebase/database';

// COMPONENTE SECUNDARIO: Tarjeta individual por cada Grado Escolar
function TarjetaCurso({ item, Oscuro, fondoTarjeta, textoPrincipal, textoSecundario, bordes }) {
  const [expandido, setExpandido] = useState(false);
  const historialClaves = item.history ? Object.keys(item.history) : [];
  const fondoExpandido = Oscuro ? '#2c2c2e' : '#fbfbfd';

  return (
    <View style={[styles.tarjeta, { backgroundColor: fondoTarjeta, borderColor: bordes }]}>
      <TouchableOpacity 
        style={styles.tarjetaHeader}
        onPress={() => setExpandido(!expandido)}
        activeOpacity={0.6}
      >
        <View style={styles.infoIzquierda}>
          <Text style={[styles.textoCurso, { color: textoPrincipal }]}>
            {item.name}
          </Text>
          <Text style={[styles.textoSubItem, { color: textoSecundario }]}>
            Progreso Ambiental
          </Text>
        </View>
        <View style={styles.infoDerecha}>
          <Text style={[styles.textoPuntaje, { color: textoPrincipal }]}>
            {item.score ? item.score.toFixed(1) : '0.0'}
          </Text>
          <Text style={[styles.textoPts, { color: textoSecundario }]}>
            pts
          </Text>
          <Text style={styles.iconoFlecha}>
            {expandido ? '▲' : '▼'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* HISTORIAL DESPLEGABLE: Muestra los kilos y puntos acumulados */}
      {expandido && (
        <View style={[styles.despliegueContenido, { backgroundColor: fondoExpandido }]}>
          <View style={[styles.lineaDivisoria, { backgroundColor: colorBordes }]} />
          <Text style={[styles.tituloSeccionSecundaria, { color: textoSecundario }]}>
            Historial de Aportes
          </Text>
          
          {historialClaves.length === 0 ? (
            <Text style={[styles.textoVacio, { color: textoSecundario }]}>
              No hay registros de reciclaje aún.
            </Text>
          ) : (
            historialClaves.map((clave) => {
              const registro = item.history[clave];
              return (
                <View key={clave} style={styles.filaHistorial}>
                  <Text style={[styles.textoHistorialTipo, { color: textoPrincipal }]}>
                    🌱 {registro.tipo || 'Reciclaje'}
                  </Text>
                  <View style={styles.historialMetricas}>
                    {registro.kg && (
                      <Text style={[styles.textoHistorialKg, { color: textoSecundario }]}>
                        {registro.kg} kg
                      </Text>
                    )}
                    <Text style={styles.textoHistorialPuntos}>
                      +{registro.Puntos} pts
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

// COMPONENTE PRINCIPAL: Tabla de posiciones general del PRAES
export default function Tablainfo({ Oscuro }) {
  const [listaGrados, setListaGrados] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Paleta de colores dinámica según el estado del switch de Modo Oscuro
  const fondoPantalla = Oscuro ? '#1c1c1e' : '#f2f2f7';
  const textoPrincipal = Oscuro ? '#ffffff' : '#1c1c1e';
  const textoSecundario = Oscuro ? '#a0a0a0' : '#8e8e93';
  const fondoTarjeta = Oscuro ? '#2c2c2e' : '#ffffff';
  const colorBordes = Oscuro ? '#3a3a3c' : '#f2f2f2';

  useEffect(() => {
    const gradosRef = ref(database, 'Grados');
    
    // Escucha activa y sincronización directa con Realtime Database
    const unsubscribe = onValue(gradosRef, (snapshot) => {
      const datos = snapshot.val();
      if (datos) {
        // Filtramos valores nulos y ordenamos el ranking de mayor a menor puntaje
        const procesados = datos
          .filter(g => g !== null)
          .sort((a, b) => (b.score || 0) - (a.score || 0));
        setListaGrados(procesados);
      }
      setCargando(false);
    }, (error) => {
      console.error("Error cargando base de datos PRAES: ", error);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  if (cargando) {
    return (
      <View style={[styles.centroCarga, { backgroundColor: fondoPantalla }]}>
        <ActivityIndicator size="large" color="#34c759" />
        <Text style={[styles.textoCarga, { color: textoSecundario }]}>
          Sincronizando Ranking...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.contenedorBase, { backgroundColor: fondoPantalla }]} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerTabla}>
          <Text style={[styles.tituloPantalla, { color: textoPrincipal }]}>
            Líderes Ambientales
          </Text>
          <Text style={[styles.subtituloPantalla, { color: textoSecundario }]}>
            Ranking oficial de reciclaje escolar
          </Text>
        </View>

        <View style={styles.bloqueLista}>
          {listaGrados.map((grado, indice) => (
            <TarjetaCurso
              key={grado.name || indice.toString()}
              item={grado}
              Oscuro={Oscuro}
              fondoTarjeta={fondoTarjeta}
              textoPrincipal={textoPrincipal}
              textoSecundario={textoSecundario}
              bordes={colorBordes}
            />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedorBase: {
    flex: 1,
  },
  centroCarga: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCarga: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  headerTabla: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  tituloPantalla: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subtituloPantalla: {
    fontSize: 14,
    marginTop: 4,
  },
  bloqueLista: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  tarjeta: {
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tarjetaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  infoIzquierda: {
    flex: 1,
  },
  textoCurso: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  textoSubItem: {
    fontSize: 12,
    marginTop: 2,
  },
  infoDerecha: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  textoPuntaje: {
    fontSize: 20,
    fontWeight: '700',
  },
  textoPts: {
    fontSize: 12,
    marginLeft: 3,
    marginRight: 12,
  },
  iconoFlecha: {
    fontSize: 12,
    color: '#c7c7cc',
    fontWeight: 'bold',
  },
  despliegueContenido: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  lineaDivisoria: {
    height: 1,
    backgroundColor: '#e5e5ea',
    marginBottom: 12,
  },
  tituloSeccionSecundaria: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textoVacio: {
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  filaHistorial: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  textoHistorialTipo: {
    fontSize: 14,
    fontWeight: '500',
  },
  historialMetricas: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoHistorialKg: {
    fontSize: 13,
    marginRight: 10,
  },
  textoHistorialPuntos: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34c759',
  },
});