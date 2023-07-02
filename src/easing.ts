export const easeOutExpo = (x: number): number =>
  x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
export const reverseEaseOutExpo = (y: number): number =>
  y === 1 ? 1 : Math.log(1 - y) / Math.log(2) / -10;
