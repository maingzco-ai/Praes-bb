import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import Tablainfo from './Components/Tablainfo.js';
import BarraNav from './Components/BarraNav.js';
import Avisos from './Components/Avisos.js';
import Retos from './Components/Retos.js';
import InfoApp from './Components/InfoApp.js';
import Admin from './Components/Admin.js';

export default function App() {
  const [Oscuro, setOscuro] = useState(false);
  const [Infoapp, setInfoapp] = useState(false);
  const [pantalla, setPantalla] = useState('tabla');
  const [userRole, setUserRole] = useState('viewer');
  const [modalLogin, setModalLogin] = useState(false);
  const [password, setPassword] = useState('');

  const intentarLogin = () => {
    if (password === 'colombo2026') {
      setUserRole('admin');
      setModalLogin(false);
      setPassword('');
    } else alert('Contraseña incorrecta');
  };

  const renderVista = () => {
    if (pantalla === 'avisos') return <Avisos Oscuro={Oscuro} userRole={userRole} />;
    if (pantalla === 'retos') return <Retos Oscuro={Oscuro} userRole={userRole} />;
    if (pantalla === 'admin') return <Admin Oscuro={Oscuro} userRole={userRole} setUserRole={setUserRole} setModalLogin={setModalLogin} />;
    return <Tablainfo Oscuro={Oscuro} />;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.base, { backgroundColor: Oscuro ? '#000' : '#F2F2F7' }]}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setOscuro(!Oscuro)}>
            <Text style={styles.icon}>{Oscuro ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setInfoapp(true)}>
            <Text style={styles.icon}>ℹ️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contenido}>
          {renderVista()}
        </View>

        <BarraNav Oscuro={Oscuro} pantalla={pantalla} onCambiarPantalla={setPantalla} />

        <Modal visible={Infoapp} transparent animationType="fade">
          <View style={styles.capaModal}>
            <View style={[styles.tarjeta, { backgroundColor: Oscuro ? '#1C1C1E' : '#FFF' }]}>
              <InfoApp />
              <TouchableOpacity style={styles.btnRojo} onPress={() => setInfoapp(false)}>
                <Text style={styles.txtBtn}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={modalLogin} transparent animationType="slide">
          <View style={styles.capaModal}>
            <View style={[styles.tarjeta, { backgroundColor: Oscuro ? '#1C1C1E' : '#FFF' }]}>
              <Text style={[styles.titulo, { color: Oscuro ? '#FFF' : '#000' }]}>Docente</Text>
              <TextInput 
                style={[styles.input, { color: Oscuro ? '#FFF' : '#000' }]} 
                secureTextEntry 
                value={password} 
                onChangeText={setPassword} 
              />
              <TouchableOpacity style={styles.btnVerde} onPress={intentarLogin}>
                <Text style={styles.txtBtn}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  base: { 
    flex: 1 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 20 
  },
  icon: { 
    fontSize: 22 
  },
  contenido: { 
    flex: 1, 
    paddingHorizontal: 16 
  },
  capaModal: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  tarjeta: { 
    width: '85%', 
    borderRadius: 20, 
    padding: 20, 
    alignItems: 'center' 
  },
  titulo: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 15 
  },
  input: { 
    width: '100%', 
    borderWidth: 1, 
    borderColor: '#DDD', 
    borderRadius: 10, 
    padding: 10, 
    marginBottom: 15 
  },
  btnVerde: { 
    backgroundColor: '#34C759', 
    padding: 12, 
    borderRadius: 10, 
    width: '100%', 
    alignItems: 'center' 
  },
  btnRojo: { 
    backgroundColor: '#FF3B30', 
    padding: 12, 
    borderRadius: 10, 
    width: '100%', 
    alignItems: 'center', 
    marginTop: 10 
  },
  txtBtn: { 
    color: '#FFF', 
    fontWeight: 'bold' 
  }
});