import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

// Motores de Audio de Expo
import { Audio } from 'expo-av';

// Importaciones de Firebase
import { database } from '../firebase'; 
import { ref, push, update, get } from 'firebase/database';

// Motores de Documentos e Impresión
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

  // FUNCIÓN PREMIUM: Reproductor de Efectos de Sonido Nativos
  const reproducirSonido = async (tipo) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        tipo === 'exito'
          ? require('../assets/sounds/success.mp3')
          : require('../assets/sounds/pop.mp3')
      );
      await sound.playAsync();
    } catch (error) {
      console.log('Audio no cargado u opcional en entorno actual.');
    }
  };

  if (userRole !== 'admin') {
    return (
      <View style={Oscuro ? styles.baseBloqueoOscura : styles.baseBloqueoClara}>
        <Text style={Oscuro ? styles.txtBloqueoOscuro : styles.txtBloqueoClaro}>
          Área Restringida
        </Text>
        <Text style={styles.subtxtBloqueo}>
          Requiere autorización de Docente del PRAES.
        </Text>
        <TouchableOpacity 
          style={styles.btnAbreLogin} 
          onPress={() => {
            reproducirSonido('pop');
            setModalLogin(true);
          }}
        >
          <Text style={styles.txtBtnLogin}>
            Ingresar Credenciales
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const publicarAviso = async () => {
    if (!titAviso || !txtAviso) return;
    await push(ref(database, 'avisos/'), { 
      titulo: titAviso, 
      contenido: txtAviso, 
      fecha: new Date().toLocaleDateString() 
    });
    setTitAviso('');
    setTxtAviso('');
    reproducirSonido('exito');
    Alert.alert('Éxito', 'Aviso publicado en el sistema.');
  };

  const registrarReciclaje = async () => {
    if (!kgPapel) return;
    const kilos = parseFloat(kgPapel);
    const puntosGanados = kilos * 15;

    const snapshot = await get(ref(database, 'Grados'));
    const datos = snapshot.val();
    
    if (datos) {
      const index = datos.findIndex(g => g && g.name === cursoReciclaje);
      if (index !== -1) {
        const updates = {};
        updates[`Grados/${index}/score`] = (datos[index].score || 0) + puntosGanados;
        updates[`Grados/${index}/history/reg_${Date.now()}`] = { 
          Puntos: puntosGanados, 
          tipo: 'Papel', 
          kg: kilos 
        };
        await update(ref(database), updates);
        setKgPapel('');
        reproducirSonido('exito');
        Alert.alert('Éxito', `Se asignaron +${puntosGanados} pts a ${cursoReciclaje}`);
      }
    }
  };

  const crearRetoGlobal = async () => {
    if (!titReto || !ptsReto) return;
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
    reproducirSonido('exito');
    Alert.alert('Éxito', 'Reto global creado.');
  };

  // NÚCLEO ARQUITECTÓNICO: Generador Dinámico de PDF con Datos de Firebase y look Premium
  const exportarPDF = async () => {
    reproducirSonido('pop');
    try {
      const snapshot = await get(ref(database, 'Grados'));
      const datos = snapshot.val();
      
      let filasHtml = '';
      if (datos) {
        const listaLimpia = datos.filter(Boolean).sort((a, b) => (b.score || 0) - (a.score || 0));
        listaLimpia.forEach((g, index) => {
          filasHtml += `
            <tr style="border-bottom: 1px solid #e5e5ea;">
              <td style="padding: 12px; font-weight: bold; color: #ff9500;">${index + 1}°</td>
              <td style="padding: 12px; font-weight: 600;">Grado ${g.name}</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; color: #34c759;">${g.score ? g.score.toFixed(1) : '0.0'} pts</td>
            </tr>
          `;
        });
      }

      const htmlCompleto = `
        <html>
          <body style="font-family: -apple-system, Helvetica, sans-serif; padding: 40px; color: #1c1c1e; background-color: #ffffff;">
            <div style="border-bottom: 3px solid #34c759; padding-bottom: 15px; margin-bottom: 20px;">
              <h1 style="font-size: 26px; margin: 0 0 5px 0; color: #1c1c1e;">Colegio Colombo Francés</h1>
              <p style="font-size: 14px; margin: 0; color: #34c759; font-weight: bold;">Reporte Oficial de Puntuación - Proyecto PRAES</p>
              <p style="font-size: 11px; margin: 5px 0 0 0; color: #8e8e93;">Generado el: ${new Date().toLocaleDateString()}</p>
            </div>
            <h2 style="font-size: 18px; margin-bottom: 15px; color: #1c1c1e;">Leaderboard / Tabla de Posiciones</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #34c759; color: #ffffff;">
                  <th style="padding: 12px; text-align: left; border-top-left-radius: 8px;">Puesto</th>
                  <th style="padding: 12px; text-align: left;">Curso</th>
                  <th style="padding: 12px; text-align: right; border-top-right-radius: 8px;">Puntaje</th>
                </tr>
              </thead>
              <tbody>
                ${filasHtml || '<tr><td colspan="3" style="text-align:center; padding:20px; color:#8e8e93;">Sin datos registrados.</td></tr>'}
              </tbody>
            </table>
            <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #8e8e93; border-top: 1px solid #e5e5ea; padding-top: 15px;">
              Este documento es un reflejo fiel de las métricas almacenadas en el Portal Digital del PRAES.
            </div>
          </body>
        </html>
      `;

      // COMPORTAMIENTO UNIVERSAL: Descarga en Navegador Web o Comparte en Móvil Nativot
      if (Platform.OS === 'web') {
        const { uri } = await Print.printToFileAsync({ html: htmlCompleto });
        const vinculo = document.createElement('a');
        vinculo.href = uri;
        vinculo.download = 'Reporte_Puntuacion_PRAES.pdf';
        document.body.appendChild(vinculo);
        vinculo.click();
        document.body.removeChild(vinculo);
      } else {
        const { uri } = await Print.printToFileAsync({ html: htmlCompleto });
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el documento estructurado.');
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
        <TouchableOpacity 
          style={styles.btnDesconectar} 
          onPress={() => {
            reproducirSonido('pop');
            setUserRole('viewer');
          }}
        >
          <Text style={styles.txtBlanco}>
            Salir a vista general
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
          style={[styles.input, { color: Oscuro ? '#fff' : '#000' }]} 
          placeholder="Kilos de papel/plástico" 
          placeholderTextColor="#8e8e93"
          keyboardType="numeric" 
          value={kgPapel} 
          onChangeText={setKgPapel} 
        />
        <TouchableOpacity style={styles.btnVerde} onPress={registrarReciclaje}>
          <Text style={styles.txtBlanco}>
            Registrar Peso
          </Text>
        </TouchableOpacity>
      </View>

      {/* SECCIÓN DE AVISOS */}
      <View style={Oscuro ? styles.tarjetaOscura : styles.tarjetaClara}>
        <Text style={styles.lblSeccion}>
          📢 Publicar Aviso / Noticia
        </Text>
        <TextInput 
          style={[styles.input, { color: Oscuro ? '#fff' : '#000' }]} 
          placeholder="Título..." 
          placeholderTextColor="#8e8e93"
          value={titAviso} 
          onChangeText={setTitAviso} 
        />
        <TextInput 
          style={[styles.input, styles.inputAlto, { color: Oscuro ? '#fff' : '#000' }]} 
          placeholder="Contenido..." 
          placeholderTextColor="#8e8e93"
          multiline 
          value={txtAviso} 
          onChangeText={setTxtAviso} 
        />
        <TouchableOpacity style={styles.btnAzul} onPress={publicarAviso}>
          <Text style={styles.txtBlanco}>
            Subir Comunicado
          </Text>
        </TouchableOpacity>
      </View>

      {/* RETOS GLOBALES */}
      <View style={Oscuro ? styles.tarjetaOscura : styles.tarjetaClara}>
        <Text style={styles.lblSeccion}>
          🎯 Crear Nuevo Reto Global
        </Text>
        <View style={styles.fila}>
          <TextInput 
            style={[styles.input, styles.flexDos, { color: Oscuro ? '#fff' : '#000' }]} 
            placeholder="Reto..." 
            placeholderTextColor="#8e8e93"
            value={titReto} 
            onChangeText={setTitReto} 
          />
          <TextInput 
            style={[styles.input, styles.flexUno, styles.marIzquierdo, { color: Oscuro ? '#fff' : '#000' }]} 
            placeholder="Pts" 
            placeholderTextColor="#8e8e93"
            keyboardType="numeric" 
            value={ptsReto} 
            onChangeText={setPtsReto} 
          />
        </View>
        <TouchableOpacity style={styles.btnVerde} onPress={crearRetoGlobal}>
          <Text style={styles.txtBlanco}>
            Inyectar Reto
          </Text>
        </TouchableOpacity>
      </View>

      {/* EXPORTAR REPORTES REALES */}
      <View style={[Oscuro ? styles.tarjetaOscura : styles.tarjetaClara, styles.marAbajo]}>
        <Text style={styles.lblSeccion}>
          📄 Exportar Métricas de Firebase
        </Text>
        <TouchableOpacity style={styles.btnExportar} onPress={exportarPDF}>
          <Text style={styles.txtBlanco}>
            Generar PDF Oficial
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    padding: 20,
  },
  baseBloqueoOscura: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    padding: 20,
  },
  txtBloqueoClaro: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 8,
  },
  txtBloqueoOscuro: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtxtBloqueo: {
    color: '#8e8e93',
    fontSize: 14,
    marginBottom: 25,
    textAlign: 'center',
  },
  btnAbreLogin: {
    backgroundColor: '#1c1c1e',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a3c',
  },
  txtBtnLogin: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
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
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
  },
  tarjetaOscura: {
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
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
    borderColor: '#ccc',
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
    backgroundColor: 'rgba(0,0,0,0.02)',
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