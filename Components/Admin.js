import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

export default function Admin({ userRole, onRoleChange, Oscuro }) {
  const fondo = Oscuro ? '#1c1c1e' : '#ffffff';
  const texto = Oscuro ? '#ffffff' : '#1c1c1e';

  return (
    <View style={[styles.contenedor, { backgroundColor: fondo }]}>
      <Text style={[styles.titulo, { color: texto }]}>Panel de Administración</Text>
      
      <View style={styles.cajaRol}>
        <Text style={{ color: texto }}>Rol actual: {userRole}</Text>
      </View>

      <TouchableOpacity 
        style={styles.boton} 
        onPress={() => onRoleChange(userRole === 'admin' ? 'viewer' : 'admin', 'Usuario')}
      >
        <Text style={styles.textoBoton}>
          Cambiar a modo {userRole === 'admin' ? 'Viewer' : 'Admin'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 20, alignItems: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  cajaRol: { padding: 15, backgroundColor: '#f2f2f7', borderRadius: 10, marginBottom: 20 },
  boton: { backgroundColor: '#007aff', padding: 15, borderRadius: 10 },
  textoBoton: { color: 'white', fontWeight: 'bold' }
});