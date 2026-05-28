import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { database } from '../firebase.js'; 
import { ref, onValue } from 'firebase/database';

function TarjetaCurso({ item, Oscuro, fondoTarjeta, textoPrincipal, textoSecundario, bordes }) {
  const [expandido, setExpandido] = useState(false);
  const historialClaves = item.history ? Object.keys(item.history) : [];
  const fondoExpandido = Oscuro ? '#2c2c2e' : '#f7f7f9';
  const colorDivisor = Oscuro ? '#3a3a3c' : '#e5e5ea';

  return (
    <View style={[styles.tarjeta,
    { backgroundColor: fondoTarjeta, borderColor: bordes }]}>
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
          <Text style={[styles.iconoFlecha, { color: textoSecundario }]}>
            {expandido ? '▲' : '▼'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* HISTORIAL DESPLEGABLE */}
      {expandido && (
        <View style={[styles.despliegueContenido, { backgroundColor: fondoExpandido }]}>
          <View style={[styles.lineaDivisoria, { backgroundColor: colorDivisor }]} />
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
                <View key={clave} style={[styles.filaHistorial, { borderBottomColor: colorDivisor }]}>
                  {/* Tipo de aporte e icono */}
                  <View style={styles.historialIzquierda}>
                    <Text style={[styles.textoHistorialTipo, { color: textoPrincipal }]}>
                      {registro.tipo === 'Papel' ? '♻️' : registro.tipo === 'Reto' ? '🏆' : '🌱'} {registro.tipo || 'Reciclaje'}
                    </Text>
                    {/* Fecha */}
                    {registro.fecha && (
                      <Text style={[styles.textoHistorialFecha, { color: textoSecundario }]}>
                        📅 {registro.fecha}
                      </Text>
                    )}
                    {/* Admin */}
                    {registro.admin && (
                      <Text style={[styles.textoHistorialAdmin, { color: textoSecundario }]}>
                        👤 {registro.admin}
                      </Text>
                    )}
                    {/* Descripcion adicional (reto) */}
                    {registro.descripcion && (
                      <Text style={[styles.textoHistorialDesc, { color: textoSecundario }]}>
                        📋 {registro.descripcion}
                      </Text>
                    )}
                    {/* Kg si aplica */}
                    {registro.kg && (
                      <Text style={[styles.textoHistorialKg, { color: textoSecundario }]}>
                        ⚖️ {registro.kg} kg
                      </Text>
                    )}
                  </View>
                  {/* Puntos */}
                  <View style={styles.historialDerecha}>
                    <Text style={[
                      styles.textoHistorialPuntos,
                      { color: registro.Puntos < 0 ? '#ff3b30' : '#34c759' }
                    ]}>
                      {registro.Puntos >= 0 ? '+' : ''}{registro.Puntos} pts
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

// COMPONENTE PRINCIPAL
export default function Tablainfo({ Oscuro }) {
  const [listaGrados, setListaGrados] = useState([]);
  const [cargando, setCargando] = useState(true);

  const fondoPantalla = Oscuro ? '#1c1c1e' : '#f2f2f7';
  const textoPrincipal = Oscuro ? '#ffffff' : '#1c1c1e';
  const textoSecundario = Oscuro ? '#a0a0a0' : '#8e8e93';
  const fondoTarjeta = Oscuro ? '#2c2c2e' : '#ffffff';
  const colorBordes = Oscuro ? '#3a3a3c' : '#f2f2f2';

  useEffect(() => {
    const gradosRef = ref(database, 'Grados');
    const unsubscribe = onValue(gradosRef, (snapshot) => {
      const datos = snapshot.val();
      if (datos) {
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
    overflow: 'hidden',
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
    gap: 3,
  },
  textoPuntaje: {
    fontSize: 20,
    fontWeight: '700',
  },
  textoPts: {
    fontSize: 12,
    marginRight: 8,
  },
  iconoFlecha: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  despliegueContenido: {
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  lineaDivisoria: {
    height: 1,
    marginBottom: 12,
  },
  tituloSeccionSecundaria: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  textoVacio: {
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  filaHistorial: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  historialIzquierda: {
    flex: 1,
    paddingRight: 10,
    gap: 2,
  },
  historialDerecha: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  textoHistorialTipo: {
    fontSize: 14,
    fontWeight: '600',
  },
  textoHistorialFecha: {
    fontSize: 11,
    marginTop: 2,
  },
  textoHistorialAdmin: {
    fontSize: 11,
  },
  textoHistorialDesc: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  textoHistorialKg: {
    fontSize: 11,
  },
  textoHistorialPuntos: {
    fontSize: 15,
    fontWeight: '700',
  },
});