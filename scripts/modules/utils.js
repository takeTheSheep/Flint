// utils.js
// Модуль для работы с локальным хранилищем и форматирования чисел
//
// Этот модуль содержит функции для сохранения и загрузки состояния игры
// в локальном хранилище браузера, а также для форматирования чисел
// в удобочитаемый вид. Он также содержит объект с названиями зданий
// и хранилищ ресурсов, которые используются в игре.

export function formatNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'МЛ';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}

export const names = {
  gold: 'Золотая шахта',
  wood: 'Лесопилка',
  stone: 'Камнеломня',
  cristal: 'Кристальная шахта',
  tavern: 'Таверна',
  beast_tavern: 'Таверна для животных'
};

export const storageNames = {
  gold: 'Хранилище золота',
  wood: 'Хранилище дерева',
  stone: 'Хранилище камня',
  cristal: 'Хранилище кристаллов'
};

const STORAGE_KEY = 'myPirateGameSave';

export function saveGame(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadGame() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

// Вызываем saveGame(state) перед закрытием вкладки
window.addEventListener('beforeunload', () => {
  // state хранится в глобальной переменной или в main.js
  saveGame(window.gameState);
});
