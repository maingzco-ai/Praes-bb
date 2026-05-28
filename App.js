import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Modal, TextInput, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Tablainfo from './Components/Tablainfo';
import BarraNav from './Components/BarraNav';
import Avisos from './Components/Avisos';
import Retos from './Components/Retos';
import InfoApp from './Components/InfoApp';
import Admin from './Components/Admin';
import Mapa from './Components/Mapa';
import { getTheme, shadows, borderRadius, spacing } from './theme';

function Header({ isDark, onToggleDark, onInfoPress }) {
  const theme = getTheme(isDark);
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={[styles.appBadge, { backgroundColor: theme.primaryLight }]}>
          <Text style={styles.appBadgeText}>PRAES</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <Pressable
          onPress={onToggleDark}
          style={[styles.iconBtn, { backgroundColor: theme.card }]}
        >
          <Text style={styles.iconText}>{isDark ? '☀️' : '🌙'}</Text>
        </Pressable>
        <Pressable
          onPress={onInfoPress}
          style={[styles.iconBtn, { backgroundColor: theme.card }]}
        >
          <Text style={styles.iconText}>ℹ️</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [screen, setScreen] = useState('tabla');
  const [userRole, setUserRole] = useState('viewer');
  const [loginVisible, setLoginVisible] = useState(false);
  const [password, setPassword] = useState('');

  const theme = getTheme(isDark);

  const changeScreen = (newScreen) => {
    if (newScreen === screen) return;
    setScreen(newScreen);
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
      case 'mapa':
        return <Mapa isDark={isDark} />;
      default:
        return <Tablainfo Oscuro={isDark} />;
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <View
        style={[
          styles.root,
          { backgroundColor: theme.background },
        ]}
      >
        <SafeAreaView style={styles.container} edges={['top']}>
          <Header
            isDark={isDark}
            onToggleDark={() => setIsDark(!isDark)}
            onInfoPress={() => setShowInfo(true)}
          />

          <View style={styles.content}>
            {renderScreen()}
          </View>

          <BarraNav
            isDark={isDark}
            screen={screen}
            onChangeScreen={changeScreen}
          />

          <Modal visible={showInfo} transparent animationType="fade">
            <View style={styles.backdrop}>
              <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
                <View style={styles.modalHandle} />
                <View style={styles.modalContent}>
                  <InfoApp isDark={isDark} />
                </View>
                <Pressable
                  style={[styles.btnClose, { backgroundColor: theme.primary }]}
                  onPress={() => setShowInfo(false)}
                >
                  <Text style={styles.btnCloseText}>Cerrar</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <Modal visible={loginVisible} transparent animationType="slide">
            <View style={styles.backdrop}>
              <View style={[styles.modalCard, styles.loginCard, { backgroundColor: theme.card }]}>
                <View style={styles.modalHandle} />
                <View style={styles.loginIconWrap}>
                  <View style={[styles.loginIconCircle, { backgroundColor: theme.primaryLight }]}>
                    <Text style={styles.loginIconText}>👨‍🏫</Text>
                  </View>
                </View>
                <Text style={[styles.loginTitle, { color: theme.text }]}>
                  Acceso Docente
                </Text>
                <Text style={[styles.loginSubtitle, { color: theme.subtle }]}>
                  Ingresa la contraseña del PRAES
                </Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: theme.inputBg,
                    color: theme.text,
                    borderColor: theme.border,
                  }]}
                  secureTextEntry
                  placeholder="Contraseña"
                  placeholderTextColor={theme.subtle}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable
                  style={[styles.loginBtn, { backgroundColor: theme.primary }]}
                  onPress={handleLogin}
                >
                  <Text style={styles.loginBtnText}>Entrar</Text>
                </Pressable>
                <Pressable
                  style={styles.loginCancel}
                  onPress={() => setLoginVisible(false)}
                >
                  <Text style={[styles.loginCancelText, { color: theme.subtle }]}>
                    Cancelar
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  appBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#34C759',
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  iconText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '88%',
    maxHeight: '80%',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.lg,
  },
  loginCard: {
    maxHeight: 'auto',
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D1D6',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalContent: {
    flex: 1,
  },
  btnClose: {
    padding: 14,
    borderRadius: borderRadius.md,
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  btnCloseText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  loginIconWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  loginIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginIconText: {
    fontSize: 32,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  loginSubtitle: {
    fontSize: 13,
    marginBottom: spacing.xl,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: 14,
    marginBottom: spacing.lg,
    fontSize: 15,
  },
  loginBtn: {
    width: '100%',
    padding: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  loginCancel: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  loginCancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
