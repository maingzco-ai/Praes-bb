import { Audio } from 'expo-av';

/**
 * Hook reutilizable de retroalimentación sonora.
 * Uso: const { play } = useSound();
 *      play('success') | play('pop')
 */
export function useSound() {
  const play = async (type = 'pop') => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        type === 'success'
          ? require('../assets/sounds/success.mp3')
          : require('../assets/sounds/pop.mp3')
      );
      await sound.playAsync();
    } catch (_) {
      // Falla silenciosamente si el archivo no existe o el dispositivo no tiene audio
    }
  };
  return { play };
}
