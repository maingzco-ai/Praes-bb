import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Modal, TextInput, Animated } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Tablainfo from './Components/Tablainfo';
import BarraNav from './Components/BarraNav';
import Avisos from './Components/Avisos';
import Retos from './Components/Retos';
import InfoApp from './Components/InfoApp';
import Admin from './Components/Admin';
import { getTheme, sharedStyles } from './theme';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [screen, setScreen] = useState('tabla');
  const [userRole, setUserRole] = useState('viewer');
  const [loginVisible, setLoginVisible] = useState(false);
  const [password, setPassword] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const theme = getTheme(isDark);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = () => {
    if (password === 'colombo2026') {
      setUserRole('admin');
      setLoginVisible(false);
      setPassword('');
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case 'avisos':
        return <Avisos isDark={isDark} userRole={userRole} />;
      case 'retos':
        return <Retos isDark={isDark} userRole={userRole} />;
      case 'admin':
        return (
          <Admin
            isDark={isDark}
            userRole={userRole}
            setUserRole={setUserRole}
            setLoginVisible={setLoginVisible}
          />
        );
      default:
        return <Tablainfo Oscuro={isDark} />;
    }
  };

  return (
    <SafeAreaProvider>
      <Animated.View style={{ flex: 1, backgroundColor: theme.background, opacity: fadeAnim }}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={() => setIsDark(!isDark)}>
              <Text style={styles.icon}>{isDark ? '☀️' : '🌙'}</Text>
            </Pressable>
            <Pressable onPress={() => setShowInfo(true)}>
              <Text style={styles.icon}>ℹ️</Text>
            </Pressable>
          </View>
          <View style={styles.content}>{renderScreen()}</View>
          <BarraNav isDark={isDark} screen={screen} onChangeScreen={setScreen} />

          {/* Info modal */}
          <Modal visible={showInfo} transparent animationType="fade">
            <View style={styles.modalBackdrop}>
              <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
                <View style={{ flex: 1 }}>
                  <InfoApp isDark={isDark} />
                </View>
                <Pressable style={styles.btnClose} onPress={() => setShowInfo(false)}>
                  <Text style={styles.btnCloseText}>Cerrar</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Login modal */}
          <Modal visible={loginVisible} transparent animationType="slide">
            <View style={styles.modalBackdrop}>
              <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.title, { color: theme.text }]}>Docente</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
                  secureTextEntry
                  placeholder="Contraseña"
                  placeholderTextColor={theme.subtle}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable
                  style={[sharedStyles.buttonBase, { backgroundColor: theme.primary }]}
                  onPress={handleLogin}
                >
                  <Text style={styles.btnText}>Entrar</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </Animated.View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  icon: { fontSize: 22 },
  content: { flex: 1, paddingHorizontal: 16 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', maxHeight: '80%', borderRadius: 20, padding: 20, flexDirection: 'column' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { width: '100%', borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 15 },
  btnClose: { backgroundColor: '#FF3B30', padding: 12, borderRadius: 8, width: '100%', alignItems: 'center' },
  btnCloseText: { color: '#fff', fontWeight: 'bold' },
  btnText: { color: '#fff', fontWeight: 'bold' },
});