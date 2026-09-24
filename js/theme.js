const STORAGE_KEY = 'theme';
const THEME = {
  light: 'light',
  dark: 'dark',
};

function getStoredTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === THEME.dark ? THEME.dark : THEME.light;
  } catch {
    return THEME.light;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
}

function syncToggle(theme) {
  const isDark = theme === THEME.dark;

  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.setAttribute('aria-pressed', String(isDark));
    button.setAttribute(
      'aria-label',
      isDark ? 'Switch to light theme' : 'Switch to dark theme',
    );
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  syncToggle(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === THEME.dark ? THEME.light : THEME.dark;
  applyTheme(next);
  saveTheme(next);
}

applyTheme(getStoredTheme());

document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
  button.addEventListener('click', toggleTheme);
});
