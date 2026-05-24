import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { getTheme, sharedStyles } from '../theme';

export default function Avisos({ isDark }) {
  const [avisos, setAvisos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = getTheme(isDark);

  useEffect(() => {
    const avisosRef = ref(database, 'avisos/');
    const unsub = onValue(avisosRef, (snap) => {
      const data = snap.val();
      const list = data
        ? Object.entries(data)
            .map(([id, val]) => ({ id, ...val }))
            .reverse()
        : [];
      setAvisos(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View
      style={[
        sharedStyles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <Text style={styles.tag}>📢 COMUNICADO OFICIAL</Text>
      <Text style={[styles.title, { color: theme.text }]}>{item.titulo}</Text>
      <Text style={[styles.body, { color: theme.text }]}>{item.contenido}</Text>
      <Text style={[styles.date, { color: theme.subtle }]}>Publicado el: {item.fecha}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={avisos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.subtle }]}>
            No hay avisos publicados aún.
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#007aff',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  date: {
    fontSize: 11,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
});