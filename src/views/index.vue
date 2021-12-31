<template>
  <div class="index">
    <div class="game-container flex-center">
      <Game></Game>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Game from "@/components/Game.vue";

@Options({
  components: {
    Game,
  },
})
export default class Index extends Vue {}
</script>
<style lang="scss" scoped></style>
