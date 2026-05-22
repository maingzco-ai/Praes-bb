import React, { useState } from 'react';
import { StyleSheet, View, TouchableHighlight, Text, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Tablainfo from './Components/Tablainfo.js';
import BarraNav from './Components/BarraNav.js';
import Avisos from './Components/Avisos.js';
import Retos from './Components/Retos.js';
import InfoApp from './Components/InfoApp.js';

export default function App() {
  const [Oscuro, setOscuro] = useState(false);
  const [Infoapp, setInfoapp] = useState(false);
  const [pantalla, setPantalla] = useState('tabla');

  const colorDeFondo = Oscuro ? '#000000' : '#ffffff';
  const colorDeTabla = Oscuro ? '#1c1c1e' : '#ffffff';

  const renderPantalla = () => {
    switch (pantalla) {
      case 'avisos':
        return <Avisos Oscuro={Oscuro} />;
      case 'retos':
        return <Retos Oscuro={Oscuro} />;
      case 'admin':
        return (
          <View style={[styles.placeholder, { backgroundColor: colorDeTabla }]}>
            <Text style={{ color: Oscuro ? '#fff' : '#000', fontSize: 16 }}>Panel Admin</Text>
          </View>
        );
      default:
        return <Tablainfo Oscuro={Oscuro} />;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colorDeFondo }]}>
        <View style={styles.topBar}>
          <TouchableHighlight onPress={() => setOscuro(!Oscuro)} underlayColor="#333333">
            <Text style={{ color: Oscuro ? 'white' : 'black', padding: 10 }}>
              {Oscuro ? '☀️' : '🌙'}
            </Text>
          </TouchableHighlight>
          <TouchableOpacity style={styles.botonInfo} onPress={() => setInfoapp(true)}>
            <Text style={styles.textoBotonInfo}>ℹ️</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={Infoapp} transparent animationType="slide">
          <View style={styles.modalContenedor}>
            <InfoApp />
            <TouchableOpacity style={styles.botonCerrar} onPress={() => setInfoapp(false)}>
              <Text style={styles.textoBotonCerrar}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <View style={[styles.table, { backgroundColor: colorDeTabla }]}>
          {renderPantalla()}
        </View>
        <View style={styles.Barranav}>
          <BarraNav
            Oscuro={Oscuro}
            pantalla={pantalla}
            onCambiarPantalla={setPantalla}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  table: { flex: 0.84 },
  Barranav: { flex: 0.16, flexDirection: 'row' },
  modalContenedor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  botonInfo: { padding: 10 },
  textoBotonInfo: { fontSize: 24 },
  botonCerrar: {
    backgroundColor: '#007aff',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  textoBotonCerrar: { color: '#fff', fontSize: 16 },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
