import { formatNum, formatResourceAmount, formatTime } from './formatters.js';
import { names, storageNames, RESOURCE_TYPES, BUILDING_TYPES } from './constants.js';

export {
  formatNum,
  formatResourceAmount,
  formatTime,
  names,
  storageNames,
  RESOURCE_TYPES,
  BUILDING_TYPES
};

/**
 * Сохраняет состояние игры в локальное хранилище.
 */
const STORAGE_KEY = 'flintGameState';
export function saveGame(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Загружает состояние игры из локального хранилища.
 */
export function loadGame() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

/* // Автоматическое сохранение при закрытии вкладки
window.addEventListener('beforeunload', () => {
  saveGame(window.gameState);
}); */