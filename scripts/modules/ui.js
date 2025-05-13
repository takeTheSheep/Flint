// ui.js
import { formatNum, names, storageNames } from './utils.js';
import { resources } from './buildings.js';
import { selected } from './events.js'; // Импортируем selected

export const menu = document.getElementById('building-menu');
export const collectBtn = document.getElementById('collect-btn');
export const upgradeBtn = document.getElementById('upgrade-btn');
export const speedupBtn = document.getElementById('speedup-btn');
export const menuImg = document.getElementById('menu-building-img');
export const titleEl = document.getElementById('menu-title');
export const levelEl = document.getElementById('menu-level');
export const bufferEl = document.getElementById('menu-buffer');
export const costEl = document.getElementById('menu-cost');

export const moveBtn = (() => {
  const btn = document.createElement('button');
  btn.id = 'move-btn'; btn.textContent = 'Переместить';
  btn.style.display = 'none'; btn.classList.add('menu-button');
  menu.appendChild(btn);
  return btn;
})();

export const tooltip = (() => {
  const t = document.createElement('div');
  t.id = 'tooltip'; t.style.position='absolute';
  t.style.background='rgba(0,0,0,0.7)'; t.style.color='white';
  t.style.padding='5px 10px'; t.style.borderRadius='5px';
  t.style.pointerEvents='none'; t.style.display='none';
  document.body.appendChild(t);
  return t;
})();

// filepath: c:\flint_game\scripts\modules\ui.js
export function updateResourcesUI() {
  document.getElementById('gold').textContent = formatNum(resources.gold);
  document.getElementById('wood').textContent = formatNum(resources.wood);
  document.getElementById('stone').textContent = formatNum(resources.stone);
  document.getElementById('cristal').textContent = formatNum(resources.cristal);
}

export function openMenu(b) {
  menu.classList.remove('hidden');
  menuImg.src = b.img.src;
  moveBtn.style.display = 'none';

  if (b.kind==='tavern'||b.kind==='beast_tavern') {
    titleEl.textContent = b.kind==='tavern' ? 'Таверна' : 'Таверна для животных';
    levelEl.textContent = bufferEl.textContent = costEl.textContent = '';
    collectBtn.style.display = upgradeBtn.style.display = speedupBtn.style.display = 'none';
    document.getElementById('menu-harvest-progress').style.display = 'none';
    document.getElementById('menu-progress').style.display = 'none';
    return;
  }

  titleEl.textContent = b.kind==='storage' ? storageNames[b.type] : names[b.type];
  levelEl.textContent = `Уровень: ${b.level}`;

  if (b.kind==='mine') {
    bufferEl.textContent = `Буфер: ${formatNum(b.buffer)} / ${formatNum(b.getBufferLimit())}`;
    collectBtn.style.display = 'inline-block';
    document.getElementById('menu-harvest-progress').style.display = 'block';
  } else {
    bufferEl.textContent = `Хранение: ${formatNum(resources[b.type])} / ${formatNum(b.capacity())}`;
    collectBtn.style.display = 'none';
    document.getElementById('menu-harvest-progress').style.display = 'none';
  }

  if (b.upgrading) {
    speedupBtn.style.display = 'inline-block';
    const now = Date.now();
    const rem = b.upgradeDuration - (now - b.upgradeStart);
    const cost = Math.ceil(rem/60000/6);
    speedupBtn.innerHTML = `Ускорить (<img src="assets/images/resurces/resurces_cristal.png" class="icon-cost">${cost})`;
    document.getElementById('menu-progress').style.display = 'block';
  
  // Обновляем прогресс улучшения
    const prog = (now - b.upgradeStart) / b.upgradeDuration;
    const pbar = document.getElementById('menu-progress-bar');
    pbar.style.width = `${Math.min(Math.floor(prog * 100), 100)}%`;
    pbar.textContent = `${Math.min(Math.floor(prog * 100), 100)}%`;
  
  
  } else {
    speedupBtn.style.display = 'none';
    document.getElementById('menu-progress').style.display = 'none';
  }

  upgradeBtn.style.display='inline-block';
  const uc = b.getUpgradeCost();
  const parts = [];
  if(uc.gold) parts.push(`<img src="assets/images/resurces/resurces_gold.png" class="icon-cost">${formatNum(uc.gold)}`);
  if(uc.wood) parts.push(`<img src="assets/images/resurces/resurces_wood.png" class="icon-cost">${formatNum(uc.wood)}`);
  if(uc.stone) parts.push(`<img src="assets/images/resurces/resurces_stone.png" class="icon-cost">${formatNum(uc.stone)}`);
  if(uc.cristal) parts.push(`<img src="assets/images/resurces/resurces_cristal.png" class="icon-cost">${formatNum(uc.cristal)}`);
  costEl.innerHTML = 'Стоимость: ' + (parts.length ? parts.join(' ') : '—');
}

export function closeMenu() {
  menu.classList.add('hidden');
  selected = null; // Сбрасываем выбранное здание
}

export function initUI() {
  collectBtn.addEventListener('click', () => document.dispatchEvent(new CustomEvent('collect')));
  upgradeBtn.addEventListener('click', () => document.dispatchEvent(new CustomEvent('upgrade')));
  speedupBtn.addEventListener('click', () => document.dispatchEvent(new CustomEvent('speedup')));
  moveBtn.addEventListener('click', () => document.dispatchEvent(new CustomEvent('move')));
  document.getElementById('menu-close').addEventListener('click', closeMenu);
  updateResourcesUI();
}
