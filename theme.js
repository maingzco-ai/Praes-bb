// theme.js – centralised colour palette and reusable style helpers

export const palette = {
  light: {
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#1C1C1E',
    subtle: '#8E8E93',
    primary: '#34C759', // green
    danger: '#FF3B30', // red
    accent: '#007AFF', // blue
    border: '#E0E0E0',
    inputBg: 'rgba(0,0,0,0.02)',
  },
  dark: {
    background: '#1C1C1E',
    card: '#2C2C2E',
    text: '#FFFFFF',
    subtle: '#8E8E93',
    primary: '#34C759',
    danger: '#FF3B30',
    accent: '#007AFF',
    border: '#3A3A3C',
    inputBg: 'rgba(255,255,255,0.02)',
  },
};

// Helper to pick the correct theme based on the boolean flag `isDark`
export const getTheme = (isDark) => (isDark ? palette.dark : palette.light);

// Reusable style objects (to be spread in component StyleSheets)
export const sharedStyles = {
  card: {
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  buttonBase: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
};
