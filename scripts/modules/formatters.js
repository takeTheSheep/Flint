/**
 * Форматирует число в удобочитаемый вид.
 */
export function formatNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'МЛ';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}

/**
 * Альтернативное имя для форматирования ресурсов.
 */
export function formatResourceAmount(n) {
  return formatNum(n);
}

/**
 * Форматирует время в минуты и секунды.
 */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}