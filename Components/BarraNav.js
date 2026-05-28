import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { getTheme, shadows } from '../theme';

function NavItem({ item, isActive, onPress, theme }) {
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <View style={styles.itemInner}>
        <View style={[styles.iconWrap, isActive && { backgroundColor: theme.accentLight }]}>
          <Image
            source={item.icon}
            style={[
              styles.icon,
              { opacity: isActive ? 1 : 0.5 },
              isActive && { tintColor: theme.accent },
            ]}
          />
        </View>
        <Text style={[styles.label, { color: isActive ? theme.accent : theme.subtle }]}>
          {item.label}
        </Text>
        {isActive && <View style={[styles.activeDot, { backgroundColor: theme.accent }]} />}
      </View>
    </Pressable>
  );
}

export default function BarraNav({ isDark, screen, onChangeScreen }) {
  const theme = getTheme(isDark);

  const items = [
    { key: 'tabla', icon: require('../assets/Rankingtable.png'), label: 'Ranking' },
    { key: 'avisos', icon: require('../assets/avisos.png'), label: 'Avisos' },
    { key: 'retos', icon: require('../assets/retos.png'), label: 'Retos' },
    { key: 'mapa', icon: require('../assets/mapa.png'), label: 'Mapa' },
    { key: 'admin', icon: require('../assets/admin.png'), label: 'Admin' },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderTopColor: theme.borderLight,
        },
        shadows.sm,
      ]}
    >
      {items.map((item) => (
        <NavItem
          key={item.key}
          item={item}
          isActive={screen === item.key}
          onPress={() => onChangeScreen(item.key)}
          theme={theme}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingBottom: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});
