// scripts/modules/buildingMenu.js
// modules/buildingMenu.js
// Модуль для работы с меню зданий
// Этот модуль содержит функции для открытия и закрытия меню зданий,
// а также для обработки событий, связанных с улучшением и сбором ресурсов.
// Он также экспортирует функции для инициализации меню и обработки событий.

import { formatNum, names, storageNames } from './utils.js';
import { closePiratesMenu }               from './unitCarousel.js';
import { selected }                       from './events.js';
import { handleTavernMenu }               from './tavernMenu.js';
import { startDrag }                      from './dragAndDrop.js';
import { store }                          from './store.js';
import { storageMap }                    from './buildings.js';


export { menu, collectBtn, upgradeBtn, speedupBtn };

// DOM-элементы меню зданий
const menu       = document.getElementById('building-menu');
const menuImg    = document.getElementById('menu-building-img');
const titleEl    = document.getElementById('menu-title');
const levelEl    = document.getElementById('menu-level');
const bufferEl   = document.getElementById('menu-buffer');
const costEl     = document.getElementById('menu-cost');
const collectBtn = document.getElementById('collect-btn');
const upgradeBtn = document.getElementById('upgrade-btn');
const speedupBtn = document.getElementById('speedup-btn');

/**
 * Открывает меню для здания b
 */
export function openMenu(b) {
  menu.classList.remove('hidden');
   // Скрываем кнопку «Переместить», если она уже есть в DOM
  const moveEl = document.getElementById('move-btn');
  if (moveEl) moveEl.style.display = 'none';

  

  // Сбрасываем скрытие, выставленное при правом клике
  bufferEl.classList.remove('hidden');
  costEl  .classList.remove('hidden');

  menuImg.src = b.img.src;
  titleEl.textContent = b.kind === 'storage'
    ? storageNames[b.type]
    : names[b.type];
  levelEl.textContent = `Уровень: ${b.level}`;

  // Скрываем прогресс-бары
  document.getElementById('menu-harvest-progress').classList.add('hidden');
  document.getElementById('menu-progress')        .classList.add('hidden');

 
// Показ/скрытие карусели таверны
  handleTavernMenu(b);  // Логика в modules/tavernMenu.js

  


 if (b.kind === 'mine') {
    // Шахта: показываем буфер и кнопку «Собрать»
    bufferEl.classList.remove('hidden');
    bufferEl.textContent      = `Буфер: ${formatNum(b.buffer)} / ${formatNum(b.getBufferLimit())}`;
    collectBtn.style.display  = 'inline-block';
    document.getElementById('menu-harvest-progress').classList.remove('hidden');
  } else if (b.kind === 'storage') {
    // Хранилище: показываем текущее количество из store
    const current = store.getState().resources[b.type] || 0;
    bufferEl.classList.remove('hidden');
    bufferEl.textContent     = `Хранение: ${formatNum(current)} / ${formatNum(b.capacity())}`;
    collectBtn.style.display = 'none';
  } else {
    // Таверна и зверинец: скрываем всё
    bufferEl.classList.add('hidden');
    collectBtn.style.display = 'none';
  }

  // === Конец нового блока ===

  // Кнопка «Улучшить» и стоимость
  upgradeBtn.style.display = 'inline-block';
  const uc = b.getUpgradeCost();
  const parts = [];
  if (uc.gold)    parts.push(`<img src="assets/images/resurces/resurces_gold.png"    class="icon-cost">${formatNum(uc.gold)}`);
  if (uc.wood)    parts.push(`<img src="assets/images/resurces/resurces_wood.png"    class="icon-cost">${formatNum(uc.wood)}`);
  if (uc.stone)   parts.push(`<img src="assets/images/resurces/resurces_stone.png"   class="icon-cost">${formatNum(uc.stone)}`);
  if (uc.cristal) parts.push(`<img src="assets/images/resurces/resurces_cristal.png" class="icon-cost">${formatNum(uc.cristal)}`);
  costEl.innerHTML = 'Стоимость: ' + (parts.length ? parts.join(' ') : '—');

  // Кнопка «Ускорить»
  speedupBtn.style.display = b.upgrading ? 'inline-block' : 'none';
}

/**
 * Закрывает меню зданий
 */
export function closeMenu() {
  menu.classList.add('hidden');
  document.getElementById('menu-harvest-progress').classList.add('hidden');
  document.getElementById('menu-progress')        .classList.add('hidden');
  closePiratesMenu();
}

/**
 * Вешаем крестик
 */
export function initBuildingMenu() {
  document.getElementById('menu-close').addEventListener('click', closeMenu);

  // -- Сбор с шахты/хранилища --
collectBtn.addEventListener('click', () => {
  if (selected?.kind === 'mine') {
    const type    = selected.type;                            // например 'wood', 'gold' и т.д.
    const buffer  = selected.buffer;                            
    const current = store.getState().resources[type] || 0;      
    const cap     = storageMap[type].capacity();                

    if (buffer <= 0) return;          // ничего не накопилось

    const spaceLeft  = cap - current;  
    if (spaceLeft <= 0) {             // хранилище уже полное
      alert('Хранилище переполнено');
     return;
    }

    // сколько реально забираем
    const toCollect = Math.min(buffer, spaceLeft);

    
     // уменьшаем буфер, НЕ трогаем таймер
 selected.buffer = buffer - toCollect;
 store.updateBuilding(selected.id, {
   buffer: selected.buffer
 });
    const collected = { [type]: toCollect };
    store.collectFromBuilding(selected.id, collected);
    openMenu(selected);  // обновить окно
  }
});


// -- Улучшение здания --
upgradeBtn.addEventListener('click', () => {
  if (selected.startUpgrade()) openMenu(selected);
});

// -- Ускорить апгрейд за кристаллы --
speedupBtn.addEventListener('click', () => {
  if (!selected?.upgrading) return;
  const now   = Date.now();
  const remMs = selected.upgradeDuration - (now - selected.upgradeStart);
  if (remMs <= 0) return;
  const cost = Math.ceil((remMs / 60000) / 6);
  const { cristal } = store.getState().resources;
  if (cristal < cost) {
    alert(`Нужно ${cost} кристаллов`);
    return;
  }
  store.updateResource('cristal', -cost);
  selected.finishUpgrade();
  openMenu(selected);
});

  // Теперь находим динамическую кнопку и вешаем её слушатель только если она есть
  const dynMove = document.getElementById('move-btn');
  if (dynMove) {
    dynMove.addEventListener('click', () => {
      if (!selected) return;
      startDrag(selected);
      closeMenu();
    });
  }
}


