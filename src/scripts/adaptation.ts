export interface AdaptationELement {
  width: number;
  height: number;
}

/**
 * 计算容器和目标元素之间的适配比例以尽量撑满整个容器
 */
export class Adaptation {
  /**
   * 容器
   */
  container: AdaptationELement;
  /**
   * 目标元素
   */
  target: AdaptationELement;

  /**
   * 容器宽高比
   */
  cr: number;
  /**
   * 目标元素宽高比
   */
  tr: number;

  /**
   * 目标元素宽度缩放比例
   */
  trw: number;

  /**
   * 目标元素高度缩放比例
   */
  trh: number;
  /**
   * 计算容器和目标元素之间的适配比例以尽量撑满整个容器
   * @param container 容器
   * @param target 目标元素
   */
  constructor(container: AdaptationELement, target: AdaptationELement) {
    this.container = container;
    this.target = target;
    this.cr = this.container.width / this.container.height;
    this.tr = this.target.width / this.target.height;
    this.trw = this.container.width / this.target.width;
    this.trh = this.container.height / this.target.height;
  }
}
