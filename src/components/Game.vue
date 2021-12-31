<template>
  <canvas class="game" ref="game"></canvas>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Game } from "@/scripts/game";
import GAME from "../config/game";

@Options({})
export default class GameComponent extends Vue {
  mounted(): void {
    this.Game = new Game(this.game, GAME.stage);
  }

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
}
</script>
<style lang="scss" scoped></style>
