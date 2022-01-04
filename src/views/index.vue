<template>
  <div class="index">
    <div class="game-container flex-center" ref="container">
      <GameComponents ref="game"></GameComponents>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import GameComponents from "@/components/Game.vue";
import GAME from "@/config/game";
import * as PIXI from "pixi.js";

@Options({
  components: {
    GameComponents,
  },
})
export default class Index extends Vue {
  private assets = [GAME.assets.main];
  private loader = new PIXI.Loader();

  /**
   * 游戏组件
   */
  private get game(): GameComponents {
    return this.$refs.game as GameComponents;
  }

  /**
   * 容器
   */
  private get container(): HTMLElement {
    return this.$refs.container as HTMLElement;
  }

  /**
   * 适配
   */
  private adaptation() {
    if (!this.game.Game) return;
    this.game.Game.adaptation(this.container);

    if (!this.game.Game.adap) return;
    if (this.game.Game.adap.cr > this.game.Game.adap.tr) {
      this.game.Game.ref.style.transform = `scale(${this.game.Game.adap.trh})`;
    } else {
      this.game.Game.ref.style.transform = `scale(${this.game.Game.adap.trw})`;
    }
  }

  private loaderAssets() {
    return new Promise<PIXI.Loader>((resolve, reject) => {
      try {
        this.loader.onComplete.add(resolve);
        for (const iter of this.assets) {
          this.loader.add(iter.name, iter.path);
        }
        this.loader.load(this.loaderAssetsProgress);
      } catch (error) {
        reject(error);
      }
    });
  }

  private loaderAssetsProgress(load: PIXI.Loader) {
    console.log(load);
  }

  mounted(): void {
    this.loaderAssets().then((load) => {
      this.game.init(load);
      this.adaptation();
    });
  }
}
</script>
<style lang="scss" scoped>
.index {
  .game-container {
    width: 100vw;
    height: 100vw;
  }
}
</style>
