import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { getTheme } from '../theme';

export default function BarraNav({ isDark, screen, onChangeScreen }) {
  const theme = getTheme(isDark);
  const items = [
    { key: 'tabla', icon: require('../assets/Rankingtable.png'), label: 'Tabla' },
    { key: 'avisos', icon: require('../assets/avisos.png'), label: 'Avisos' },
    { key: 'retos', icon: require('../assets/retos.png'), label: 'Retos' },
    { key: 'admin', icon: require('../assets/admin.png'), label: 'Admin' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          style={styles.item}
          onPress={() => onChangeScreen(item.key)}
        >
          <Image source={item.icon} style={styles.icon} />
          <Text style={{ color: screen === item.key ? theme.accent : theme.text, fontSize: 11 }}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  item: {
    alignItems: 'center',
    flex: 0.25,
  },
  icon: { width: 28, height: 28, resizeMode: 'contain', marginBottom: 4 },
});