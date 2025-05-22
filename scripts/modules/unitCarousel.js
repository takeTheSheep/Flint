// scripts/modules/unitCarousel.js
// Модуль для работы с каруселью юнитов
import { pirates } from './pirates.js';
import { animals } from './animals.js';
import { store } from './store.js';
import { updateResourcesUI } from './ui.js';

// DOM-элементы карусели и overlay
const piratesMenu       = document.getElementById('pirates-menu');
const piratesMenuClose  = document.getElementById('pirates-menu-close');
const piratesList       = document.getElementById('pirates-list');
const carouselLeft      = document.getElementById('carousel-left');
const carouselRight     = document.getElementById('carousel-right');
const pirateDetails     = document.getElementById('pirate-details');
const pirateImage       = document.getElementById('pirate-image');
const pirateName        = document.getElementById('pirate-name');
const pirateDescription = document.getElementById('pirate-description');
const pirateStats1      = document.getElementById('pirate-stats-1');
const pirateStats2      = document.getElementById('pirate-stats-2');
const pirateCost1       = document.getElementById('pirate-cost-1');
const pirateCost2       = document.getElementById('pirate-cost-2');
const pirateType        = document.getElementById('pirate-type');
const hireBtn           = document.getElementById('hire-btn');

let currentTavernLevel = 0;

/**
 * Заполняет список пиратов в карусели для таверны (список без overlay)
 */
export function openPiratesMenu(tavernLevel) {
  currentTavernLevel = tavernLevel;
  hideOverlay();
  pirateDetails.classList.add('hidden');
  piratesList.innerHTML = '';

  pirates.forEach(p => {
    const item = document.createElement('div');
    item.classList.add('pirate-item');
    if (p.unlockLevel > tavernLevel) item.classList.add('locked');
    const img = document.createElement('img');
    img.src = p.portrait;
    img.alt = p.name;
    item.appendChild(img);
    item.addEventListener('click', () => showPirateDetails(p));
    piratesList.appendChild(item);
  });
}

/**
 * Заполняет список животных в карусели для звериной таверны (список без overlay)
 */
export function openBeastsMenu(tavernLevel) {
  currentTavernLevel = tavernLevel;
  hideOverlay();
  pirateDetails.classList.add('hidden');
  piratesList.innerHTML = '';

  animals.forEach(a => {
    const item = document.createElement('div');
    item.classList.add('pirate-item');
    if (a.unlockLevel > tavernLevel) item.classList.add('locked');
    const img = document.createElement('img');
    img.src = a.portrait;
    img.alt = a.name;
    item.appendChild(img);
    item.addEventListener('click', () => showPirateDetails(a));
    piratesList.appendChild(item);
  });
}

/**
 * Показывает overlay с деталями выбранного юнита
 */
function showPirateDetails(p) {
  piratesMenu.classList.remove('hidden');
  pirateDetails.classList.remove('hidden');

  pirateImage.src        = p.portrait.replace('_portret', '');
  pirateName.textContent = p.name;
  pirateType.textContent = `Тип: ${p.type}`;
  pirateDescription.textContent = p.description;
  pirateDescription.scrollTop = 0;
  pirateStats1.textContent = `Здоровье: ${p.stats.health} Атака: ${p.stats.attack}`;
  pirateStats2.textContent = `Защита: ${p.stats.defense} Скорость: ${p.stats.speed}`;
  pirateCost1.textContent = `Золото: ${p.cost.gold} Дерево: ${p.cost.wood}`;
  pirateCost2.textContent = `Камень: ${p.cost.stone}`;

  if (p.unlockLevel > currentTavernLevel) {
    hireBtn.disabled = true;
    hireBtn.textContent = 'Недоступно';
    hireBtn.onclick = null;
  } else {
    hireBtn.disabled = false;
    hireBtn.textContent = 'Нанять';
    hireBtn.onclick = () => hirePirate(p);
  }
}

/**
 * Закрывает overlay и детали пирата
 */
export function closePiratesMenu() {
  pirateDetails.classList.add('hidden');
  piratesMenu.classList.add('hidden');
}

/**
 * Вспомогательный: скрыть только overlay без очистки списка
 */
function hideOverlay() {
  piratesMenu.classList.add('hidden');
}

// Обработчик крестика: прячет только overlay, оставляя карусель
piratesMenuClose.addEventListener('click', hideOverlay);

// Прокрутка листа пиратов
carouselLeft.addEventListener('click', () => piratesList.scrollBy({ left: -100, behavior: 'smooth' }));
carouselRight.addEventListener('click', () => piratesList.scrollBy({ left:  100, behavior: 'smooth' }));

/**
 * Обработчик найма
 */
function hirePirate(p) {
  // Берём актуальные ресурсы из store
  const { gold: G, wood: W, stone: S } = store.getState().resources;
  const { gold, wood, stone } = p.cost;
  const missing = [];
  if (G < gold)   missing.push(`золота ${gold  - G}`);
  if (W < wood)   missing.push(`дерева ${wood  - W}`);
  if (S < stone)  missing.push(`камня ${stone - S}`);

  if (missing.length === 0) {
    // Списываем через store
    store.updateResource('gold',  -gold);
    store.updateResource('wood',  -wood);
    store.updateResource('stone', -stone);
    // Обновляем отображение ресурсов
    updateResourcesUI();
    alert(`${p.name} нанят!`);
  } else {
    alert(`Недостаточно ресурсов: ${missing.join(', ')}`);
  }
}
