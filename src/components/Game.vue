<template>
  <div class="game" ref="game"></div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import * as PIXI from "pixi.js";
import GAME from "../config/game";

@Options({})
export default class Game extends Vue {
  mounted(): void {
    this.init();
  }

  /**
   * PIXI DOM容器
   */
  private get game(): HTMLElement {
    return this.$refs.game as HTMLElement;
  }

  /**
   * 初始化PIXI
   */
  private init() {
    const app = new PIXI.Application(GAME.stage);
    this.game.appendChild(app.view);
  }
}
</script>
<style lang="scss" scoped></style>
