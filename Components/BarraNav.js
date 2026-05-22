import { TouchableHighlight, View, Image, Text, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView style={[styles.contenedor, { backgroundColor: fondoBarra }]}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  itemNav: {
    flex: 0.25,
    alignItems: 'center',
  },
  itemContenido: {
    alignItems: 'center',
  },
  icono: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
  },
});
