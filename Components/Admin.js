import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

// Importaciones de Firebase Realtime Database
import { database } from '../firebase'; 
import { ref, push, update, get } from 'firebase/database';

// Librerías de Expo para PDF y Compartir de forma nativa
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function Admin({ Oscuro, userRole, setUserRole, setModalLogin }) {
  const [titAviso, setTitAviso] = useState('');
  const [txtAviso, setTxtAviso] = useState('');
  const [cursoReciclaje, setCursoReciclaje] = useState('Primero');
  const [kgPapel, setKgPapel] = useState('');
  const [titReto, setTitReto] = useState('');
  const [ptsReto, setPtsReto] = useState('');

  const grados = [
    'Primero', 
    'Segundo', 
    'Tercero', 
    'Cuarto', 
    'Quinto', 
    'Sexto', 
    'Septimo', 
    'Octavo', 
    'Noveno', 
    'Decimo', 
    'Once'
  ];

  // PANTALLA DE BLOQUEO: Si el rol no es admin, no renderiza las herramientas
  if (userRole !== 'admin') {
    return (
      <View style={Oscuro ? styles.baseBloqueoOscura : styles.baseBloqueoClara}>
        <Text style={Oscuro ? styles.txtBloqueoOscuro : styles.txtBloqueoClaro}>
          Área Restringida
        </Text>
        <Text style={styles.subtxtBloqueo}>
          Solo docentes autorizados del PRAES.
        </Text>
        <TouchableOpacity style={styles.btnAzul} onPress={() => setModalLogin(true)}>
          <Text style={styles.txtBlanco}>
            Ingresar Credenciales
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // LOGICA 1: PUBLICAR AVISO
  const publicarAviso = async () => {
    if (!titAviso || !txtAviso) return;
    try {
      await push(ref(database, 'avisos/'), { 
        titulo: titAviso, 
        contenido: txtAviso, 
        fecha: new Date().toLocaleDateString() 
      });
      setTitAviso('');
      setTxtAviso('');
      Alert.alert('Éxito', 'Aviso publicado en el muro escolar y en la Tabla.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo publicar el aviso.');
    }
  };

  // LOGICA 2: REGISTRAR RECICLAJE (Kilos -> Puntos)
  const registrarReciclaje = async () => {
    if (!kgPapel) return;
    const kilos = parseFloat(kgPapel);
    const puntosGanados = kilos * 15; // Factor PRAES: 1kg = 15 puntos

    try {
      const snapshot = await get(ref(database, 'Grados'));
      const datos = snapshot.val();
      
      if (datos) {
        const index = datos.findIndex(g => g && g.name === cursoReciclaje);
        if (index !== -1) {
          const scoreActual = datos[index].score || 0;
          const updates = {};
          
          updates[`Grados/${index}/score`] = scoreActual + puntosGanados;
          updates[`Grados/${index}/history/reg_${Date.now()}`] = { 
            Puntos: puntosGanados, 
            tipo: 'Papel', 
            kg: kilos 
          };
          
          await update(ref(database), updates);
          setKgPapel('');
          Alert.alert('Puntos Asignados', `+${puntosGanados} pts a ${cursoReciclaje}`);
        } else {
          Alert.alert('Error', 'Grado no encontrado en el Ranking.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Error al conectar con la base de datos.');
    }
  };

  // LOGICA 3: INYECTAR RETO GLOBAL A TODOS
  const crearRetoGlobal = async () => {
    if (!titReto || !ptsReto) return;
    try {
      const paquete = {};
      const idUnico = 'reto_' + Date.now();
      
      grados.forEach(g => {
        paquete[`retos/${g}/${idUnico}`] = { 
          titulo: titReto, 
          puntos: parseInt(ptsReto) || 0, 
          completado: false 
        };
      });
      
      await update(ref(database), paquete);
      setTitReto('');
      setPtsReto('');
      Alert.alert('Éxito', 'Reto inyectado a los 11 grados.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo inyectar el reto global.');
    }
  };

  // LOGICA 4: INICIALIZAR RETOS BASE (SIEMBRA)
  const inicializarBaseDatos = async () => {
    try {
      const retosEjemplo = [
        { tit: "Traer 15 botellas plásticas", pts: 10 },
        { tit: "Apagar luces del salón al salir", pts: 5 },
        { tit: "Reciclar papel del periodo", pts: 20 }
      ];
      const paquete = {};
      
      grados.forEach(g => {
        retosEjemplo.forEach((r, i) => {
          paquete[`retos/${g}/reto_base_${i}`] = { 
            titulo: r.tit, 
            puntos: r.pts, 
            completado: false 
          };
        });
      });
      
      await update(ref(database), paquete);
      Alert.alert('¡Base Inicializada!', 'Los retos básicos fueron creados en la pestaña Retos.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo inicializar la base.');
    }
  };

  // LOGICA 5: EXPORTAR A PDF
  const exportarPDF = async () => {
    const html = `
      <html>
        <body style="font-family: Helvetica; padding: 40px; color: #1c1c1e;">
          <h1 style="color: #34c759; border-bottom: 2px solid #34c759; padding-bottom: 10px;">Portal PRAES</h1>
          <h2>Reporte Oficial de Puntuación</h2>
          <p>Documento oficial generado de forma automática desde el dispositivo móvil del docente.</p>
          <p style="color: #8e8e93; font-style: italic;">Sincronizado con Firebase Realtime Database.</p>
        </body>
      </html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) { 
      Alert.alert('Error', 'No se pudo generar el reporte PDF.'); 
    }
  };

  return (
    <ScrollView 
      style={Oscuro ? styles.baseOscura : styles.baseClara} 
      showsVerticalScrollIndicator={false}
    >
      
      <View style={styles.header}>
        <Text style={Oscuro ? styles.tituloMainOscuro : styles.tituloMainClaro}>
          Centro de Comando
        </Text>
        <TouchableOpacity style={styles.btnDesconectar} onPress={() => setUserRole('viewer')}>
          <Text style={styles.txtBlanco}>
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      </View>

      {/* REGISTRO DE RECICLAJE */}
      <View style={Oscuro ? styles.tarjetaOscura : styles.tarjetaClara}>
        <Text style={styles.lblSeccion}>
          ⚖️ Registro de Reciclaje
        </Text>
        <View style={styles.bordePicker}>
          <Picker 
            selectedValue={cursoReciclaje} 
            onValueChange={setCursoReciclaje} 
            style={Oscuro ? styles.pickerOscuro : styles.pickerClaro}
            dropdownIconColor={Oscuro ? '#ffffff' : '#1c1c1e'}
          >
            {grados.map(g => <Picker.Item key={g} label={`Grado ${g}`} value={g} />)}
          </Picker>
        </View>
        <TextInput 
          style={[styles.input, { color: texto }]} 
          placeholder="Kilos de papel/plástico" 
          placeholderTextColor="#8e8e93"
          keyboardType="numeric" 
          value={kgPapel} 
          onChangeText={setKgPapel} 
        />
        <TouchableOpacity style={styles.btnVerde} onPress={registrarReciclaje}>
          <Text style={styles.txtBlanco}>
            Registrar y Sumar Puntos
          </Text>
        </TouchableOpacity>
      </View>

      {/* SECCIÓN DE AVISOS */}
      <View style={Oscuro ? styles.tarjetaOscura : styles.tarjetaClara}>
        <Text style={styles.lblSeccion}>
          📢 Publicar Aviso
        </Text>
        <TextInput 
          style={[styles.input, { color: texto }]} 
          placeholder="Título del aviso" 
          placeholderTextColor="#8e8e93"
          value={titAviso} 
          onChangeText={setTitAviso} 
        />
        <TextInput 
          style={[styles.input, styles.inputAlto, { color: texto }]} 
          placeholder="Contenido..." 
          placeholderTextColor="#8e8e93"
          multiline 
          value={txtAviso} 
          onChangeText={setTxtAviso} 
        />
        <TouchableOpacity style={styles.btnAzul} onPress={publicarAviso}>
          <Text style={styles.txtBlanco}>
            Subir al Muro
          </Text>
        </TouchableOpacity>
      </View>

      {/* RETOS GLOBALES */}
      <View style={Oscuro ? styles.tarjetaOscura : styles.tarjetaClara}>
        <Text style={styles.lblSeccion}>
          🎯 Retos Globales
        </Text>
        <View style={styles.fila}>
          <TextInput 
            style={[styles.input, styles.flexDos, { color: texto }]} 
            placeholder="Nuevo Reto..." 
            placeholderTextColor="#8e8e93"
            value={titReto} 
            onChangeText={setTitReto} 
          />
          <TextInput 
            style={[styles.input, styles.flexUno, styles.marIzquierdo, { color: texto }]} 
            placeholder="Pts" 
            placeholderTextColor="#8e8e93"
            keyboardType="numeric" 
            value={ptsReto} 
            onChangeText={setPtsReto} 
          />
        </View>
        <TouchableOpacity style={styles.btnVerde} onPress={crearRetoGlobal}>
          <Text style={styles.txtBlanco}>
            Inyectar a todos los cursos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnAmarillo} onPress={inicializarBaseDatos}>
          <Text style={styles.txtBlanco}>
            INICIALIZAR RETOS BASE
          </Text>
        </TouchableOpacity>
      </View>

      {/* EXPORTAR REPORTES */}
      <View style={[Oscuro ? styles.tarjetaOscura : styles.tarjetaClara, styles.marAbajo]}>
        <Text style={styles.lblSeccion}>
          📄 Documentos Oficiales
        </Text>
        <TouchableOpacity style={styles.btnExportar} onPress={exportarPDF}>
          <Text style={styles.txtBlanco}>
            Exportar Reporte a PDF
          </Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  baseClara: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f2f2f7',
  },
  baseOscura: {
    flex: 1,
    padding: 15,
    backgroundColor: '#1c1c1e',
  },
  baseBloqueoClara: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
  },
  baseBloqueoOscura: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
  },
  txtBloqueoClaro: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 10,
  },
  txtBloqueoOscuro: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtxtBloqueo: {
    color: '#8e8e93',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tituloMainClaro: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c1c1e',
  },
  tituloMainOscuro: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  btnDesconectar: {
    backgroundColor: '#ff3b30',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  tarjetaClara: {
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
  },
  tarjetaOscura: {
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    backgroundColor: '#2c2c2e',
    borderColor: '#3a3a3c',
  },
  lblSeccion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8e8e93',
    marginBottom: 12,
  },
  bordePicker: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
  },
  fila: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  flexUno: {
    flex: 1,
  },
  flexDos: {
    flex: 2,
  },
  marIzquierdo: {
    marginLeft: 10,
  },
  marAbajo: {
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  inputAlto: {
    height: 80,
    textAlignVertical: 'top',
  },
  btnVerde: {
    backgroundColor: '#34c759',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnAzul: {
    backgroundColor: '#007aff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnAmarillo: {
    backgroundColor: '#ff9500',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  btnExportar: {
    backgroundColor: '#1c1c1e',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  txtBlanco: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pickerClaro: {
    height: 50,
    color: '#1c1c1e',
  },
  pickerOscuro: {
    height: 50,
    color: '#ffffff',
  },
});