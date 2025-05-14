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

let currentTavernLevel = 0;

export function openPiratesMenu(tavernLevel) {
  // Сохраняем текущий уровень таверны и наполняем список
  currentTavernLevel = tavernLevel;
  pirateDetails.classList.add('hidden');
  piratesList.innerHTML = '';

  pirates.forEach(pirate => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('pirate-item');

    // Если пират ещё не доступен — затемняем и ставим замок
    if (pirate.unlockLevel > tavernLevel) {
      wrapper.classList.add('locked');
    }

    const img = document.createElement('img');
    img.src = pirate.portrait;
    img.alt = pirate.name;
    wrapper.appendChild(img);

    // Всегда открываем детали (даже заблокированных)
    wrapper.addEventListener('click', () => {
      showPirateDetails(pirate);
    });

    piratesList.appendChild(wrapper);
  });
}

export function closePiratesMenu() {
  piratesMenu.classList.add('hidden');
  pirateDetails.classList.add('hidden');

  pirateImage.src = '';
  pirateName.textContent = '';
  pirateDescription.textContent = '';
  pirateStats.textContent = '';
  pirateCost.textContent = '';
  hireBtn.onclick = null;
}

piratesMenuClose.addEventListener('click', () => {
  closePiratesMenu();
});

carouselLeft.addEventListener('click', () => {
  piratesList.scrollBy({ left: -100, behavior: 'smooth' });
});

carouselRight.addEventListener('click', () => {
  piratesList.scrollBy({ left: 100, behavior: 'smooth' });
});

function showPirateDetails(pirate) {
  // Показываем меню и детали
  piratesMenu.classList.remove('hidden');
  pirateDetails.classList.remove('hidden');

  // Подготавливаем путь к "большому" изображению
  const pirateImagePath = pirate.portrait.replace('_portret', '');
  pirateImage.src = pirateImagePath;

  // Наполняем информацию
  pirateName.textContent = pirate.name;
  pirateDescription.textContent = pirate.description;
  pirateStats.textContent = `Атака: ${pirate.stats.attack}, Защита: ${pirate.stats.defense}, Скорость: ${pirate.stats.speed}, Здоровье: ${pirate.stats.health}`;
  pirateCost.textContent = `Стоимость: Золото: ${pirate.cost.gold}, Дерево: ${pirate.cost.wood}, Камень: ${pirate.cost.stone}`;

  // Если пират заблокирован — делаем кнопку недоступной
  if (pirate.unlockLevel > currentTavernLevel) {
    hireBtn.disabled = true;
    hireBtn.textContent = 'Недоступно';
    hireBtn.onclick = null;
  } else {
    hireBtn.disabled = false;
    hireBtn.textContent = 'Нанять';
    hireBtn.onclick = () => hirePirate(pirate);
  }
}

function hirePirate(pirate) {
  const { gold, wood, stone } = pirate.cost;
  const missing = [];
  if (resources.gold < gold) missing.push(`золота ${gold - resources.gold}`);
  if (resources.wood < wood) missing.push(`дерева ${wood - resources.wood}`);
  if (resources.stone < stone) missing.push(`камня ${stone - resources.stone}`);

  if (missing.length === 0) {
    resources.gold -= gold;
    resources.wood -= wood;
    resources.stone -= stone;
    updateResourcesUI();
    alert(`${pirate.name} нанят!`);
  } else {
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
  const elapsed = now - building.lastCollect;
  const total = building.collectInterval;
  const progress = Math.min(elapsed / total, 1);
  if (harvestBar && progressText) {
    harvestBar.style.transition = 'none';
    harvestBar.style.width = `${progress * 100}%`;
    progressText.textContent = `${Math.floor(elapsed / 1000)} / ${Math.ceil(total / 1000)}с`;
    if (progress >= 1) {
      building.lastCollect = now;
      harvestBar.style.transition = 'none';
      harvestBar.style.width = '0%';
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

  document.getElementById('menu-harvest-progress').classList.add('hidden');
  document.getElementById('menu-progress').classList.add('hidden');

  const piratesCarousel = document.getElementById('pirates-carousel');
  const piratesMenu = document.getElementById('pirates-menu');

  if (b.kind === 'tavern') {
    piratesCarousel.classList.remove('hidden');
    piratesMenu.classList.add('hidden');
    pirateDetails.classList.add('hidden');
    openPiratesMenu(b.level);
  } else {
    piratesCarousel.classList.add('hidden');
    piratesList.innerHTML = '';
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
    const harvestBar = document.getElementById('menu-harvest-bar');
    const progressText = document.querySelector('#menu-harvest-progress .progress-text');
    if (harvestBar) {
      harvestBar.style.transition = 'none';
      harvestBar.style.width = '0%';
      progressText.textContent = `0 / ${Math.ceil(b.collectInterval / 1000)}с`;
    }
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
  const ucFinal = b.getUpgradeCost();
  const finalParts = [];
  if (ucFinal.gold) finalParts.push(`<img src="assets/images/resurces/resurces_gold.png" class="icon-cost">${formatNum(ucFinal.gold)}`);
  if (ucFinal.wood) finalParts.push(`<img src="assets/images/resurcs/resurces_wood.png" class="icon-cost">${formatNum(ucFinal.wood)}`);
  if (ucFinal.stone) finalParts.push(`<img src="assets/images/resurces/resurces_stone.png" class="icon-cost">${formatNum(ucFinal.stone)}`);
  if (ucFinal.cristal) finalParts.push(`<img src="assets/images/resurces/resurces_cristal.png" class="icon-cost">${formatNum(ucFinal.cristal)}`);
  costEl.innerHTML = 'Стоимость: ' + (finalParts.length ? finalParts.join(' ') : '—');
}

export function closeMenu() {
  menu.classList.add('hidden');
  document.getElementById('menu-harvest-progress').classList.add('hidden');
  document.getElementById('menu-progress').classList.add('hidden');
  import('./events.js').then(events => {
    if (typeof events.resetSelected === 'function') {
      events.resetSelected();
    }
  });
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
