import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { database } from '../firebase.js'; 
import { ref, onValue } from 'firebase/database';

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
          <Text style={[styles.textoCurso, { color: textoPrincipal }]}>{item.name}</Text>
          <Text style={[styles.textoSubItem, { color: textoSecundario }]}>Progreso Ambiental</Text>
        </View>
        <View style={styles.infoDerecha}>
          <Text style={[styles.textoPuntaje, { color: textoPrincipal }]}>{item.score ? item.score.toFixed(1) : '0.0'}</Text>
          <Text style={[styles.textoPts, { color: textoSecundario }]}>pts</Text>
          <Text style={styles.iconoFlecha}>{expandido ? ' ◟ ' : ' ◝ '}</Text>
        </View>
      </TouchableOpacity>
      {expandido && (
        <View style={[styles.despliegueContenido, { backgroundColor: fondoExpandido }]}>
          <View style={[styles.lineaDivisoria, { backgroundColor: bordes }]} />
          <Text style={[styles.tituloSeccionSecundaria, { color: textoSecundario }]}>Historial de Aportes</Text>
          
          {historialClaves.length > 0 ? (
            historialClaves.slice(0, 3).map((key) => (
              <View key={key} style={styles.itemHistorial}>
                <Text style={[styles.textoLog, { color: textoSecundario }]}>• Registro: {key.substring(0, 6)}</Text>
                <Text style={styles.textoLogPts}>+{item.history[key].Puntos || item.history[key].score || 0} pts</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.textoHistorialVacio, { color: textoSecundario }]}>Sin registros de aportes recientes.</Text>
          )}
        </View>
      )}
    </View>
  );
}

export default function Tablainfo({ Oscuro }) {
  const [cursos, setCursos] = useState([]);
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const fondoTabla = Oscuro ? '#1c1c1e' : '#ffffff';
  const textoPrincipal = Oscuro ? '#ffffff' : '#1c1c1e';
  const textoSecundario = Oscuro ? '#a0a0a0' : '#8e8e93';
  const fondoNoticias = Oscuro ? '#2c2c2e' : '#fbfbfd';
  const bordes = Oscuro ? '#3a3a3c' : '#f2f2f7';

  useEffect(() => {
    console.log("📡 Conectando a la raíz del PRAES...");
    const rootRef = ref(database, '/'); 

    const desubscribir = onValue(rootRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        // 1. PROCESAR GRADOS (Tu Arreglo Real)
        if (data.Grados) {
          // Eliminamos el espacio vacío inicial del arreglo con filter(Boolean)
          const listaLimpia = data.Grados.filter(Boolean);
          // Ordenamos de mayor a menor puntuación por Score
          listaLimpia.sort((a, b) => (b.score || 0) - (a.score || 0));
          setCursos(listaLimpia);
        }

        // 2. PROCESAR NOTICIAS (Tu Objeto Real)
        if (data.Noticias) {
          const clavesNoticias = Object.keys(data.Noticias);
          if (clavesNoticias.length > 0) {
            // Tomamos la última noticia subida por el administrador
            const ultimaClave = clavesNoticias[clavesNoticias.length - 1];
            setNoticia(data.Noticias[ultimaClave]);
          }
        }
      }
      setLoading(false);
    }, (error) => {
      console.error("🚫 Error en Firebase:", error.message);
      setLoading(false);
    });

    return () => desubscribir();
  }, []);

  if (loading) {
    return (
      <View style={styles.contenedorCarga}>
        <ActivityIndicator size="small" color="#000000" />
      </View>
    );
  }

  const estiloDinamico = {
    contenedorPrincipal: { backgroundColor: fondoTabla },
    noticias: { backgroundColor: fondoNoticias, borderBottomColor: bordes },
    tarjetaNoticia: { backgroundColor: fondoTabla, borderColor: bordes },
    tituloNoticia: { color: textoPrincipal },
    contenidoNoticia: { color: textoSecundario },
    placeholderNoticias: { color: textoSecundario },
    tituloSeccion: { color: textoPrincipal },
    textoSinvatos: { color: textoSecundario },
  };

  return (
    <SafeAreaView style={[styles.contenedorPrincipal, estiloDinamico.contenedorPrincipal]}>
      
      <View style={[styles.espacioNoticias, estiloDinamico.noticias]}>
        {noticia ? (
          <View style={[styles.tarjetaNoticiaContenedor, estiloDinamico.tarjetaNoticia]}>
            <Text style={styles.tagNoticia}>NUEVO RETO</Text>
            <Text style={[styles.tituloNoticia, estiloDinamico.tituloNoticia]}>{noticia.title}</Text>
            <Text style={[styles.contenidoNoticia, estiloDinamico.contenidoNoticia]}>{noticia.content}</Text>
            <Text style={styles.autorNoticia}>Por: {noticia.author} • {noticia.date}</Text>
          </View>
        ) : (
          <Text style={[styles.placeholderNoticias, estiloDinamico.placeholderNoticias]}>No hay noticias disponibles</Text>
        )}
      </View>

      <View style={styles.seccionLista}>
        <Text style={[styles.tituloSeccion, estiloDinamico.tituloSeccion]}>Leaderboard</Text>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {cursos.length === 0 ? (
            <Text style={[styles.textoSinvatos, estiloDinamico.textoSinvatos]}>No hay posiciones registradas.</Text>
          ) : (
            cursos.map((curso, index) => (
              <TarjetaCurso key={index} item={curso} Oscuro={Oscuro}
                fondoTarjeta={fondoTabla} textoPrincipal={textoPrincipal}
                textoSecundario={textoSecundario} bordes={bordes} />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedorPrincipal: { flex: 1, backgroundColor: '#ffffff' },
  espacioNoticias: {
    height: '35%',
    backgroundColor: '#fbfbfd', // Gris sutil característico de Apple
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  tarjetaNoticiaContenedor: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  tagNoticia: { fontSize: 10, fontWeight: '700', color: '#007aff', letterSpacing: 1, marginBottom: 4 },
  tituloNoticia: { fontSize: 20, fontWeight: '700', color: '#1c1c1e', letterSpacing: -0.5, marginBottom: 4 },
  contenidoNoticia: { fontSize: 14, color: '#3a3a3c', lineHeight: 18, marginBottom: 8 },
  autorNoticia: { fontSize: 11, color: '#8e8e93', fontWeight: '500' },
  placeholderNoticias: { color: '#a0a0a0', fontSize: 14, textAlign: 'center' },
  seccionLista: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  tituloSeccion: { fontSize: 22, fontWeight: '700', color: '#000000', marginBottom: 16, letterSpacing: -0.5 },
  scrollContent: { paddingBottom: 20 },
  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f2f2f2',
  },
  tarjetaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  infoIzquierda: { flex: 1 },
  textoCurso: { fontSize: 18, fontWeight: '600', color: '#1c1c1e', letterSpacing: -0.4 },
  textoSubItem: { fontSize: 12, color: '#8e8e93', marginTop: 2 },
  infoDerecha: { flexDirection: 'row', alignItems: 'baseline' },
  textoPuntaje: { fontSize: 20, fontWeight: '700', color: '#000000' },
  textoPts: { fontSize: 12, color: '#8e8e93', marginLeft: 3, marginRight: 8 },
  iconoFlecha: { fontSize: 12, color: '#c7c7cc', fontWeight: 'bold' },
  despliegueContenido: { paddingHorizontal: 18, paddingBottom: 18, backgroundColor: '#fbfbfd', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  lineaDivisoria: { height: 1, backgroundColor: '#f2f2f7', marginBottom: 12 },
  tituloSeccionSecundaria: { fontSize: 13, fontWeight: '600', color: '#3a3a3c', marginBottom: 8 },
  itemHistorial: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  textoLog: { fontSize: 13, color: '#636366' },
  textoLogPts: { fontSize: 13, fontWeight: '600', color: '#34c759' },
  textoHistorialVacio: { fontSize: 13, color: '#8e8e93', fontStyle: 'italic' },
  contenedorCarga: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
  textoSinvatos: { textAlign: 'center', color: '#8e8e93', fontSize: 14, marginTop: 30 }
});