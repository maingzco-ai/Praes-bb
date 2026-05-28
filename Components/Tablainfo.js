import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { database } from '../firebase.js';
import { ref, onValue } from 'firebase/database';
import { shadows, borderRadius, spacing } from '../theme';

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

function PulseCircle({ color }) {
  return <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />;
}

function TarjetaCurso({ item, Oscuro, index, fondoTarjeta, textoPrincipal, textoSecundario, bordes }) {
  const [expandido, setExpandido] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;
  const historialClaves = item.history ? Object.keys(item.history) : [];
  const fondoExpandido = Oscuro ? '#2c2c2e' : '#f7f7f9';
  const colorDivisor = Oscuro ? '#3a3a3c' : '#e5e5ea';
  const isTop3 = index < 3;
  const rank = index + 1;

  const toggleExpand = () => {
    const toValue = expandido ? 0 : 1;
    Animated.spring(expandAnim, {
      toValue,
      damping: 20,
      stiffness: 150,
      useNativeDriver: false,
    }).start();
    setExpandido(!expandido);
  };

  const maxHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500],
  });

  return (
    <View
      style={[
        styles.tarjeta,
        {
          backgroundColor: fondoTarjeta,
          borderColor: isTop3 ? MEDAL_COLORS[index] : bordes,
          borderWidth: isTop3 ? 1.5 : 1,
        },
        shadows.md,
      ]}
    >
      <TouchableOpacity
        style={styles.tarjetaHeader}
        onPress={toggleExpand}
        activeOpacity={0.6}
      >
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>
            {isTop3 ? MEDALS[index] : `#${rank}`}
          </Text>
        </View>
        <View style={styles.infoIzquierda}>
          <Text style={[styles.textoCurso, { color: textoPrincipal }]}>
            {item.name}
          </Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.textoPuntaje, { color: isTop3 ? MEDAL_COLORS[index] : textoPrincipal }]}>
              {(item.score || 0).toFixed(1)}
            </Text>
            <Text style={[styles.textoPts, { color: textoSecundario }]}>pts</Text>
          </View>
        </View>
        <View style={styles.chevronWrap}>
          <Text style={[styles.chevron, { color: textoSecundario }]}>
            {expandido ? '▲' : '▼'}
          </Text>
        </View>
      </TouchableOpacity>

      <Animated.View style={[styles.despliegueContenido, { maxHeight, overflow: 'hidden' }]}>
        <View style={[styles.lineaDivisoria, { backgroundColor: colorDivisor }]} />
        <Text style={[styles.tituloSeccionSecundaria, { color: textoSecundario }]}>
          Historial de Aportes
        </Text>

        {historialClaves.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.textoVacio, { color: textoSecundario }]}>
              No hay registros de reciclaje aún
            </Text>
          </View>
        ) : (
          historialClaves.map((clave) => {
            const registro = item.history[clave];
            return (
              <View key={clave} style={[styles.filaHistorial, { borderBottomColor: colorDivisor }]}>
                <View style={styles.historialIzquierda}>
                  <View style={styles.historialTipoRow}>
                    <Text style={styles.historialIcon}>
                      {registro.tipo === 'Papel' ? '♻️' : registro.tipo === 'Reto' ? '🏆' : '🌱'}
                    </Text>
                    <Text style={[styles.textoHistorialTipo, { color: textoPrincipal }]}>
                      {registro.tipo || 'Reciclaje'}
                    </Text>
                  </View>
                  {registro.fecha && (
                    <Text style={[styles.textoHistorialFecha, { color: textoSecundario }]}>
                      {registro.fecha}
                    </Text>
                  )}
                  {registro.admin && (
                    <Text style={[styles.textoHistorialAdmin, { color: textoSecundario }]}>
                      {registro.admin}
                    </Text>
                  )}
                  {registro.descripcion && (
                    <Text style={[styles.textoHistorialDesc, { color: textoSecundario }]}>
                      {registro.descripcion}
                    </Text>
                  )}
                  {registro.kg && (
                    <Text style={[styles.textoHistorialKg, { color: textoSecundario }]}>
                      {registro.kg} kg
                    </Text>
                  )}
                </View>
                <View style={styles.historialDerecha}>
                  <View style={[styles.pointsBadge, {
                    backgroundColor: registro.Puntos < 0 ? '#FFEBEE' : '#E8F8ED',
                  }]}>
                    <Text style={[
                      styles.textoHistorialPuntos,
                      { color: registro.Puntos < 0 ? '#ff3b30' : '#34c759' }
                    ]}>
                      {registro.Puntos >= 0 ? '+' : ''}{registro.Puntos}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </Animated.View>
    </View>
  );
}

export default function Tablainfo({ Oscuro }) {
  const [listaGrados, setListaGrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

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
        setLastUpdate(new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }));
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
          Cargando ranking...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.contenedorBase, { backgroundColor: fondoPantalla }]} edges={['left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerTabla}>
          <Text style={[styles.tituloPantalla, { color: textoPrincipal }]}>
            Ranking Ambiental
          </Text>
          <Text style={[styles.subtituloPantalla, { color: textoSecundario }]}>
            Clasificación general del PRAES
          </Text>
          {lastUpdate && (
            <View style={styles.updateRow}>
              <PulseCircle color="#34C759" />
              <Text style={[styles.updateText, { color: textoSecundario }]}>
                Actualizado {lastUpdate}
              </Text>
            </View>
          )}
        </View>

        {/* Podium visual top 3 */}
        {listaGrados.length >= 3 && (
          <View style={styles.podiumRow}>
            {[1, 0, 2].map((pos) => {
              const g = listaGrados[pos];
              if (!g) return null;
              const heights = [130, 100, 80];
              return (
                <View key={pos} style={styles.podiumItem}>
                  <Text style={styles.podiumMedal}>{MEDALS[pos]}</Text>
                  <Text style={[styles.podiumName, { color: textoPrincipal }]} numberOfLines={1}>
                    {g.name}
                  </Text>
                  <Text style={[styles.podiumScore, { color: MEDAL_COLORS[pos] }]}>
                    {(g.score || 0).toFixed(1)}
                  </Text>
                  <View style={[styles.podiumBar, {
                    height: heights[pos],
                    backgroundColor: MEDAL_COLORS[pos],
                    opacity: 0.85,
                  }]} />
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.bloqueLista}>
          {listaGrados.map((grado, indice) => (
            <TarjetaCurso
              key={grado.name || indice.toString()}
              item={grado}
              index={indice}
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
  contenedorBase: { flex: 1 },
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
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  tituloPantalla: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtituloPantalla: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '400',
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  updateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  podiumRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: 12,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  podiumMedal: {
    fontSize: 28,
    marginBottom: 4,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  podiumScore: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  podiumBar: {
    width: '70%',
    borderRadius: 8,
    minHeight: 20,
  },
  bloqueLista: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 30,
  },
  tarjeta: {
    borderRadius: borderRadius.lg,
    marginBottom: 12,
    overflow: 'hidden',
  },
  tarjetaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  rankBadge: {
    width: 40,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  rankText: {
    fontSize: 22,
  },
  infoIzquierda: {
    flex: 1,
  },
  textoCurso: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginTop: 2,
  },
  textoPuntaje: {
    fontSize: 22,
    fontWeight: '800',
  },
  textoPts: {
    fontSize: 12,
    fontWeight: '500',
  },
  chevronWrap: {
    marginLeft: 8,
  },
  chevron: {
    fontSize: 12,
    fontWeight: '700',
  },
  despliegueContenido: {
    paddingHorizontal: 18,
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
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingBottom: 14,
  },
  emptyIcon: {
    fontSize: 16,
  },
  textoVacio: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  filaHistorial: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  historialIzquierda: {
    flex: 1,
    paddingRight: 10,
    gap: 2,
  },
  historialTipoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historialIcon: {
    fontSize: 14,
  },
  historialDerecha: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  pointsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
    fontSize: 14,
    fontWeight: '700',
  },
});
