// settings.js — persisted user settings.
const KEY = 'counter-offensive.settings.v1';

const DEFAULTS = {
  sens: 2.2,            // CS-style: degrees = counts * 0.022 * sens
  fov: 90,
  volume: 0.6,
  chSize: 6,
  chGap: 2,
  chThick: 2,
  chDot: false,
  chDynamic: true,
  chColor: '#38ff5a',
  bob: true,
  shadows: true,
  blood: true,
  team: 'CT',
  difficulty: 1,
  matchLen: 12,
  invertY: false,
  touchSens: 1,         // touch screens: drag-to-look speed multiplier
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch (e) {
    return { ...DEFAULTS };
  }
}

export const settings = load();

export function saveSettings() {
  try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) { /* private mode */ }
}

export function resetSettings() {
  Object.assign(settings, DEFAULTS);
  saveSettings();
}
