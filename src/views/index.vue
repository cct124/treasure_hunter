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

@Options({
  components: {
    GameComponents,
  },
})
export default class Index extends Vue {
  private get game(): GameComponents {
    return this.$refs.game as GameComponents;
  }

  private get container(): HTMLElement {
    return this.$refs.container as HTMLElement;
  }

  /**
   * 适配
   */
  private adaptation() {
    if (!this.game.Game) return;
    this.game.Game.adaptation(this.container, this.game.$el);

    if (!this.game.Game.adap) return;
    if (this.game.Game.adap.cr > this.game.Game.adap.tr) {
      (
        this.game.$el as HTMLElement
      ).style.transform = `scale(${this.game.Game.adap.trh})`;
    } else {
      (
        this.game.$el as HTMLElement
      ).style.transform = `scale(${this.game.Game.adap.trw})`;
    }
  }

  mounted(): void {
    this.adaptation();
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
