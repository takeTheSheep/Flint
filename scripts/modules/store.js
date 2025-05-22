// scripts/modules/store.js
import { saveGame, loadGame } from './utils.js';

// Начальное «пустое» состояние
const state = {
  resources: {
    gold: 0,
    wood: 0,
    stone: 0,
    cristal: 0
  },
  buildings: {},   // { [buildingId]: { level, buffer, lastCollect, upgrading, upgradeStart, upgradeDuration } }
  units: {},       // { [unitId]: { ... } }
  quests: {}       // { [questId]: { ... } }
};

// Подписчики на события
const listeners = {};

// При инициализации загружаем сохранённое
const persisted = loadGame();
if (persisted) {
  if (persisted.resources)  Object.assign(state.resources, persisted.resources);
  if (persisted.buildings)  Object.assign(state.buildings, persisted.buildings);
  if (persisted.units)      Object.assign(state.units, persisted.units);
  if (persisted.quests)     Object.assign(state.quests, persisted.quests);
}

/**
 * Уведомляет подписчиков события и сохраняет всё state.
 * @param {string} event
 * @param {*} newValue
 * @param {*} oldValue
 */
function notify(event, newValue, oldValue) {
  if (listeners[event]) {
    listeners[event].forEach(cb => cb(newValue, oldValue));
  }
  saveGame(state);
}

/** @returns {object} Глубокая копия state */
export function getState() {
  return JSON.parse(JSON.stringify(state));
}

/** @param {string} event @param {Function} callback */
export function subscribe(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
}

/** @param {string} event @param {Function} callback */
export function unsubscribe(event, callback) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter(cb => cb !== callback);
}

/**
 * Установить ресурс в точное значение и уведомить.
 * @param {string} type
 * @param {number} amount
 */
export function setResource(type, amount) {
  if (!(type in state.resources)) {
    console.warn(`Unknown resource type: ${type}`);
    return;
  }
  const old = state.resources[type];
  state.resources[type] = amount;
  notify('resources', getState().resources, { [type]: old });
}

/**
 * Изменить ресурс на дельту и уведомить.
 * @param {string} type
 * @param {number} delta
 */
export function updateResource(type, delta) {
  if (!(type in state.resources)) {
    console.warn(`Unknown resource type: ${type}`);
    return;
  }
  const old = state.resources[type];
  state.resources[type] += delta;
  notify('resources', getState().resources, { [type]: old });
}

/**
 * Собрать ресурсы с здания и уведомить.
 * @param {string} buildingId
 * @param {{[resType: string]: number}} amountByResource
 */
export function collectFromBuilding(buildingId, amountByResource) {
  Object.entries(amountByResource).forEach(([type, amount]) => {
    updateResource(type, amount);
  });
  notify('collect', { buildingId, amountByResource }, null);
}

// Экспортируем единый API
export const store = {
  getState,
  subscribe,
  unsubscribe,
  setResource,
  updateResource,
  collectFromBuilding,

  /**
   * Частичное обновление состояния одного здания и уведомление.
   * @param {string} buildingId
   * @param {object} changes — { level?, buffer?, lastCollect?, upgrading?, upgradeStart?, upgradeDuration? }
   */
  updateBuilding(buildingId, changes) {
    const prev = state.buildings[buildingId] || {};
    const updated = { ...prev, ...changes };
    state.buildings[buildingId] = updated;
    notify('buildings', getState().buildings, prev);
  }
};
