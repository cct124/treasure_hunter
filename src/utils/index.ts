// export class Adaptation {
//   constructor() {

//   }
// }
/**
 * 生成一个从 `start` 到 `end` 的递增数字数组
 * @param start
 * @param end
 * @returns
 */
export function genArr(start: number, end: number): number[] {
  return Array.from(new Array(end + 1).keys()).slice(start);
}

/**
 * 在某个数字区间内取随机数
 * @param maxNum 最大值
 * @param minNum 最小值
 * @param decimalNum 几位小数
 * @returns
 */
export function randomNum(
  maxNum: number,
  minNum: number,
  decimalNum?: number
): number {
  let max = 0,
    min = 0;
  minNum <= maxNum
    ? ((min = minNum), (max = maxNum))
    : ((min = maxNum), (max = minNum));
  switch (arguments.length) {
    case 1:
      return Math.floor(Math.random() * (max + 1));
    case 2:
      return Math.floor(Math.random() * (max - min + 1) + min);
    case 3:
      return parseFloat(
        (Math.random() * (max - min) + min).toFixed(decimalNum)
      );
    default:
      return Math.random();
  }
}
