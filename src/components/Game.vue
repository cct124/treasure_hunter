<template>
  <canvas class="game" ref="game"></canvas>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Game } from "@/scripts/game";
import GAME from "../config/game";
import * as PIXI from "pixi.js";

@Options({})
export default class GameComponent extends Vue {
  /**
   * 游戏实例
   */
  Game: Game | undefined;

  /**
   * PIXI DOM容器
   */
  private get game(): HTMLCanvasElement {
    return this.$refs.game as HTMLCanvasElement;
  }

  /**
   * 初始化游戏实例
   */
  init(loader: PIXI.Loader): Game {
    this.Game = new Game(this.game, {
      ...GAME.stage,
      resource: loader.resources,
      assets: GAME.assets,
      spriteNames: GAME.spriteNames,
      monsterNum: 6,
    });
    return this.Game;
  }
}
</script>
<style lang="scss" scoped></style>
