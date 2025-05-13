// utils.js
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
