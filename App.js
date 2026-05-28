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
  const [isDark, setIsDark]       = useState(false);
  const [showInfo, setShowInfo]   = useState(false);
  const [screen, setScreen]       = useState('tabla');
  const [userRole, setUserRole]   = useState('viewer');
  const [loginVisible, setLoginVisible] = useState(false);
  const [password, setPassword]   = useState('');

  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(1)).current;
  const theme       = getTheme(isDark);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);


  const changeScreen = (newScreen) => {
    if (newScreen === screen) return;
    Animated.timing(contentAnim, {
      toValue: 0,
      duration: 130,
      useNativeDriver: true,
    }).start(() => {
      setScreen(newScreen);
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  };

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
      <Animated.View
        style={[
          styles.root,
          { backgroundColor: theme.background },
          { opacity: fadeAnim },
        ]}
      >
        <SafeAreaView style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => setIsDark(!isDark)}>
              <Text style={styles.icon}>{isDark ? '☀️' : '🌙'}</Text>
            </Pressable>
            <Pressable onPress={() => setShowInfo(true)}>
              <Text style={styles.icon}>ℹ️</Text>
            </Pressable>
          </View>

          <Animated.View style={[styles.content, { opacity: contentAnim }]}>
            {renderScreen()}
          </Animated.View>

          <BarraNav isDark={isDark} screen={screen} onChangeScreen={changeScreen} />

          {/* Modal Info */}
          <Modal visible={showInfo} transparent animationType="fade">
            <View style={styles.backdrop}>
              <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
                <View style={styles.modalContent}>
                  <InfoApp isDark={isDark} />
                </View>
                <Pressable style={styles.btnClose} onPress={() => setShowInfo(false)}>
                  <Text style={styles.btnCloseText}>Cerrar</Text>
                </Pressable>
              </View>
            </View>
         </Modal>
         <Modal visible={loginVisible} transparent animationType="slide">
            <View style={styles.backdrop}>
              <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.loginTitle, { color: theme.text }]}>Docente</Text>
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
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  icon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'column',
  },
  modalContent: {
    flex: 1,
  },
  btnClose: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  btnCloseText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});