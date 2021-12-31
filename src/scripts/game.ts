import * as PIXI from "pixi.js";
import { StageConfig } from "@/config/game";
import { Adaptation } from "@/scripts/adaptation";

/**
 * 游戏主类
 */
export class Game {
  app: PIXI.Application;
  adap: Adaptation | null = null;
  constructor(ref: HTMLCanvasElement, cfg: StageConfig) {
    this.app = new PIXI.Application({ ...cfg, view: ref });
    // ref.appendChild(this.app.view);
  }

  adaptation(container: HTMLElement, target: HTMLElement): Adaptation {
    this.adap = new Adaptation(
      {
        width: container.offsetWidth,
        height: container.offsetHeight,
      },
      {
        width: target.offsetWidth,
        height: target.offsetHeight,
      }
    );
    console.log(this.adap);

    return this.adap;
  }
}
