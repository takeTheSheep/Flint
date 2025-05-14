// ui.js
import { formatNum, names, storageNames } from './utils.js';
import { resources } from './buildings.js';
import { pirates } from './pirates.js';

export const menu = document.getElementById('building-menu');
export const collectBtn = document.getElementById('collect-btn');
export const upgradeBtn = document.getElementById('upgrade-btn');
export const speedupBtn = document.getElementById('speedup-btn');
export const menuImg = document.getElementById('menu-building-img');
export const titleEl = document.getElementById('menu-title');
export const levelEl = document.getElementById('menu-level');
export const bufferEl = document.getElementById('menu-buffer');
export const costEl = document.getElementById('menu-cost');

const piratesMenu = document.getElementById('pirates-menu');
const piratesMenuClose = document.getElementById('pirates-menu-close');
const piratesList = document.getElementById('pirates-list');
const carouselLeft = document.getElementById('carousel-left');
const carouselRight = document.getElementById('carousel-right');
const pirateDetails = document.getElementById('pirate-details');
const pirateImage = document.getElementById('pirate-image');
const pirateName = document.getElementById('pirate-name');
const pirateDescription = document.getElementById('pirate-description');
const pirateStats = document.getElementById('pirate-stats');
const pirateCost = document.getElementById('pirate-cost');
const hireBtn = document.getElementById('hire-btn');

export function openPiratesMenu(tavernLevel) {
  //piratesMenu.classList.remove('hidden');
  pirateDetails.classList.add('hidden'); // Скрываем детали пирата при открытии меню
  piratesList.innerHTML = ''; // Очищаем список пиратов
  piratesMenu.classList.add('hidden'); 
  // Добавляем пиратов в список
  pirates
    .filter(p => p.unlockLevel <= tavernLevel)
    .forEach(pirate => {
      const img = document.createElement('img');
      img.src = pirate.portrait;
      img.alt = pirate.name;

      // Добавляем обработчик для отображения деталей пирата
      img.addEventListener('click', () => {
        showPirateDetails(pirate);
      });

      piratesList.appendChild(img);
    });
}

export function closePiratesMenu() {
  piratesMenu.classList.add('hidden'); // Скрываем меню пирата
  pirateDetails.classList.add('hidden'); // Скрываем детали пирата

  // Сбрасываем содержимое деталей пирата
  pirateImage.src = '';
  pirateName.textContent = '';
  pirateDescription.textContent = '';
  pirateStats.textContent = '';
  pirateCost.textContent = '';
  hireBtn.onclick = null; // Убираем обработчик события
}

// Добавляем обработчик события для закрытия меню
piratesMenuClose.addEventListener('click', () => {
  piratesMenu.classList.add('hidden'); // Скрываем меню пирата
  pirateDetails.classList.add('hidden'); // Скрываем детали пирата
});

carouselLeft.addEventListener('click', () => {
  piratesList.scrollBy({ left: -100, behavior: 'smooth' });
});

carouselRight.addEventListener('click', () => {
  piratesList.scrollBy({ left: 100, behavior: 'smooth' });
});


function showPirateDetails(pirate) {
 piratesMenu.classList.remove('hidden');
 // если меню было скрыто крестиком — открываем его
 piratesMenu.classList.remove('hidden');
  pirateDetails.classList.remove('hidden');

  // Заменяем "_portret" на пустую строку для меню пирата
  const pirateImagePath = pirate.portrait.replace('_portret', '');

  pirateImage.src = pirateImagePath; // Устанавливаем путь к изображению без "_portret"
  pirateName.textContent = pirate.name;
  pirateDescription.textContent = pirate.description;
  pirateStats.textContent = `Атака: ${pirate.stats.attack}, Защита: ${pirate.stats.defense}, Скорость: ${pirate.stats.speed}, Здоровье: ${pirate.stats.health}`;
  pirateCost.textContent = `Стоимость: Золото: ${pirate.cost.gold}, Дерево: ${pirate.cost.wood}, Камень: ${pirate.cost.stone}`;
  hireBtn.onclick = () => hirePirate(pirate);
}

function hirePirate(pirate) {
  const { gold, wood, stone } = pirate.cost;
 // Считаем недостачи
const missing = [];
if (resources.gold  < gold ) missing.push(`золота ${gold  - resources.gold}`);
if (resources.wood  < wood ) missing.push(`дерева ${wood  - resources.wood}`);
if (resources.stone < stone) missing.push(`камня ${stone - resources.stone}`);

if (missing.length === 0) {
// Достаточно ресурсов — списываем их и обновляем UI
resources.gold  -= gold;
resources.wood  -= wood;
resources.stone -= stone;
    updateResourcesUI();  // ← не забудьте импортировать функцию из ui.js :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}
  alert(`${pirate.name} нанят!`);
} else {
 // Выводим список того, чего не хватает
  alert(`Недостаточно ресурсов! Не хватает: ${missing.join(', ')}.`);
  }
}

export const moveBtn = (() => {
  const btn = document.createElement('button');
  btn.id = 'move-btn';
  btn.textContent = 'Переместить';
  btn.style.display = 'none';
  btn.classList.add('menu-button');
  menu.appendChild(btn);
  return btn;
})();

export const tooltip = (() => {
  const t = document.createElement('div');
  t.id = 'tooltip';
  t.style.position = 'absolute';
  t.style.background = 'rgba(0,0,0,0.7)';
  t.style.color = 'white';
  t.style.padding = '5px 10px';
  t.style.borderRadius = '5px';
  t.style.pointerEvents = 'none';
  t.classList.add('hidden');
  document.body.appendChild(t);
  return t;
})();

export function updateResourcesUI() {
  document.getElementById('gold').textContent = formatNum(resources.gold);
  document.getElementById('wood').textContent = formatNum(resources.wood);
  document.getElementById('stone').textContent = formatNum(resources.stone);
  document.getElementById('cristal').textContent = formatNum(resources.cristal);
}

function updateHarvestProgress(building) {
  const harvestBar = document.getElementById('menu-harvest-bar');
  const progressText = document.querySelector('#menu-harvest-progress .progress-text');
  const now = Date.now();
  const elapsed = now - building.lastCollect; // Время, прошедшее с последнего сбора
  const total = building.collectInterval; // Полное время сбора

  if (harvestBar && progressText) {
    // Рассчитываем прогресс
    const progress = Math.min(elapsed / total, 1); // Прогресс в процентах

    // Убираем анимацию временно
    harvestBar.style.transition = 'none'; // Отключаем анимацию
    harvestBar.style.width = `${progress * 100}%`;
    progressText.textContent = `${Math.floor(elapsed / 1000)} / ${Math.ceil(total / 1000)}с`;

    // Если сбор завершен, сбрасываем шкалу моментально
    if (progress >= 1) {
      building.lastCollect = now; // Обновляем время последнего сбора
      harvestBar.style.transition = 'none'; // Отключаем анимацию
      harvestBar.style.width = '0%'; // Сбрасываем ширину шкалы моментально
      progressText.textContent = `0 / ${Math.ceil(total / 1000)}с`;
    }
  }
}

export function openMenu(b) {
  menu.classList.remove('hidden');
  menuImg.src = b.img.src;
  moveBtn.style.display = 'none';

  titleEl.textContent = b.kind === 'storage' ? storageNames[b.type] : names[b.type];
  levelEl.textContent = `Уровень: ${b.level}`;

  // Скрываем все прогресс-бары
  document.getElementById('menu-harvest-progress').classList.add('hidden');
  document.getElementById('menu-progress').classList.add('hidden');

  const piratesCarousel = document.getElementById('pirates-carousel');
  const piratesMenu = document.getElementById('pirates-menu');

  // Показываем прокрутку пиратов только для таверны
  if (b.kind === 'tavern') {
    piratesCarousel.classList.remove('hidden'); // Показываем карусель
    piratesMenu.classList.add('hidden'); // Скрываем меню пиратов при открытии таверны
    pirateDetails.classList.add('hidden'); // Скрываем детали пирата
    openPiratesMenu(b.level); // Открываем меню пиратов с учётом уровня таверны
  } else {
    piratesCarousel.classList.add('hidden'); // Скрываем карусель для других зданий
    piratesList.innerHTML = ''; // Очищаем список пиратов
  }

  if (b.kind === 'tavern' || b.kind === 'beast_tavern') {
    bufferEl.textContent = '';
    collectBtn.style.display = 'none';

    if (b.upgrading) {
      speedupBtn.style.display = 'inline-block';
      const now = Date.now();
      const rem = b.upgradeDuration - (now - b.upgradeStart);
      const cost = Math.ceil(rem / 60000 / 6);
      speedupBtn.innerHTML = `Ускорить (<img src="assets/images/resurces/resurces_cristal.png" class="icon-cost">${cost})`;

      const upgradeProgressEl = document.getElementById('menu-progress');
      upgradeProgressEl.classList.remove('hidden');
      const prog = (now - b.upgradeStart) / b.upgradeDuration;
      const pbar = document.getElementById('menu-progress-bar');
      pbar.style.width = `${Math.min(Math.floor(prog * 100), 100)}%`;
      pbar.textContent = `${Math.min(Math.floor(prog * 100), 100)}%`;
    } else {
      speedupBtn.style.display = 'none';
    }
    upgradeBtn.style.display = 'inline-block';
    const uc = b.getUpgradeCost();
    const parts = [];
    if (uc.gold) parts.push(`<img src="assets/images/resurces/resurces_gold.png" class="icon-cost">${formatNum(uc.gold)}`);
    if (uc.wood) parts.push(`<img src="assets/images/resurces/resurces_wood.png" class="icon-cost">${formatNum(uc.wood)}`);
    if (uc.stone) parts.push(`<img src="assets/images/resurces/resurces_stone.png" class="icon-cost">${formatNum(uc.stone)}`);
    costEl.innerHTML = 'Стоимость: ' + (parts.length ? parts.join(' ') : '—');
    return;
  }

  if (b.kind === 'mine') {
    bufferEl.textContent = `Буфер: ${formatNum(b.buffer)} / ${formatNum(b.getBufferLimit())}`;
    collectBtn.style.display = 'inline-block';
    document.getElementById('menu-harvest-progress').classList.remove('hidden');


// Сбрасываем шкалу перед обновлением
    const harvestBar = document.getElementById('menu-harvest-bar');
    const progressText = document.querySelector('#menu-harvest-progress .progress-text');
    if (harvestBar) {
      harvestBar.style.transition = 'none'; // Убираем анимацию
      harvestBar.style.width = '0%'; // Сбрасываем ширину шкалы
    }
    if (progressText) {
      progressText.textContent = `0 / ${Math.ceil(b.collectInterval / 1000)}с`; // Сбрасываем текст прогресса
    }

    // Обновляем шкалу прогресса
    updateHarvestProgress(b);

  } else {
    bufferEl.textContent = `Хранение: ${formatNum(resources[b.type])} / ${formatNum(b.capacity())}`;
    collectBtn.style.display = 'none';
  }

  if (b.upgrading) {
    speedupBtn.style.display = 'inline-block';
    const now = Date.now();
    const rem = b.upgradeDuration - (now - b.upgradeStart);
    const cost = Math.ceil(rem / 60000 / 6);
    speedupBtn.innerHTML = `Ускорить (<img src="assets/images/resurces/resurces_cristal.png" class="icon-cost">${cost})`;

    const upgradeProgressEl = document.getElementById('menu-progress');
    upgradeProgressEl.classList.remove('hidden');
    const prog = (now - b.upgradeStart) / b.upgradeDuration;
    const pbar = document.getElementById('menu-progress-bar');
    pbar.style.width = `${Math.min(Math.floor(prog * 100), 100)}%`;
    pbar.textContent = `${Math.min(Math.floor(prog * 100), 100)}%`;
  } else {
    speedupBtn.style.display = 'none';
  }

  upgradeBtn.style.display = 'inline-block';
  const uc = b.getUpgradeCost();
  const parts = [];
  if (uc.gold) parts.push(`<img src="assets/images/resurces/resurces_gold.png" class="icon-cost">${formatNum(uc.gold)}`);
  if (uc.wood) parts.push(`<img src="assets/images/resurces/resurces_wood.png" class="icon-cost">${formatNum(uc.wood)}`);
  if (uc.stone) parts.push(`<img src="assets/images/resurces/resurces_stone.png" class="icon-cost">${formatNum(uc.stone)}`);
  if (uc.cristal) parts.push(`<img src="assets/images/resurces/resurces_cristal.png" class="icon-cost">${formatNum(uc.cristal)}`);
  costEl.innerHTML = 'Стоимость: ' + (parts.length ? parts.join(' ') : '—');
}

export function closeMenu() {
  menu.classList.add('hidden');
  document.getElementById('menu-harvest-progress').classList.add('hidden');
  document.getElementById('menu-progress').classList.add('hidden');

  // Скрываем шкалу прогресса
  const harvestBar = document.getElementById('menu-harvest-bar');
  const progressText = document.querySelector('#menu-harvest-progress .progress-text');
  if (harvestBar) harvestBar.style.width = '0%';
  if (progressText) progressText.textContent = '';

  // Используем функцию для сброса состояния вместо изменения модуля
  import('./events.js').then(events => {
    if (typeof events.resetSelected === 'function') {
      events.resetSelected(); // Вызываем функцию для сброса состояния
    } else {
      console.warn('resetSelected function is not defined in events.js');
    }
  });

  // Закрываем меню пиратов вместе с меню таверны
  closePiratesMenu();
}

export function initUI() {
  collectBtn.addEventListener('click', () => document.dispatchEvent(new CustomEvent('collect')));
  upgradeBtn.addEventListener('click', () => document.dispatchEvent(new CustomEvent('upgrade')));
  speedupBtn.addEventListener('click', () => document.dispatchEvent(new CustomEvent('speedup')));
  moveBtn.addEventListener('click', () => document.dispatchEvent(new CustomEvent('move')));
  document.getElementById('menu-close').addEventListener('click', closeMenu);
  updateResourcesUI();
  closePiratesMenu();
}
