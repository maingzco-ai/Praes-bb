import { TouchableHighlight, View, Image, Text, StyleSheet } from "react-native";

export default function BarraNav({ Oscuro, pantalla, onCambiarPantalla }) {
  const fondoBarra = Oscuro ? '#1c1c1e' : '#ffffff';
  const textoColor = Oscuro ? '#ffffff' : '#000000';
  const activeColor = '#007aff';

  const items = [
    { clave: 'tabla', icono: require('../assets/Rankingtable.png'), label: 'Tabla' },
    { clave: 'avisos', icono: require('../assets/avisos.png'), label: 'Avisos' },
    { clave: 'retos', icono: require('../assets/retos.png'), label: 'Retos' },
    { clave: 'admin', icono: require('../assets/admin.png'), label: 'Admin' },
  ];

  return (
    <View style={[styles.contenedor, { backgroundColor: fondoBarra }]}>
      {items.map((item) => (
        <TouchableHighlight
          key={item.clave}
          style={styles.itemNav}
          onPress={() => onCambiarPantalla(item.clave)}
          underlayColor="transparent"
        >
          <View style={styles.itemContenido}>
            <Image source={item.icono} style={styles.icono} />
            <Text style={[styles.label, { color: pantalla === item.clave ? activeColor : textoColor }]}>
              {item.label}
            </Text>
          </View>
        </TouchableHighlight>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    height: 70, // <-- LA SOLUCIÓN: Altura fija, no flex.
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  itemNav: { flex: 0.25, alignItems: 'center' },
  itemContenido: { alignItems: 'center' },
  icono: { width: 28, height: 28, resizeMode: 'contain', marginBottom: 4 },
  label: { fontSize: 11 },
});