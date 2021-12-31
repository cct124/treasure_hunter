export interface StageConfig {
  width: number;
  height: number;
  backgroundColor: number;
}

export interface GameConfig {
  stage: StageConfig;
}

/**
 * 游戏配置信息
 */
const GAME: GameConfig = {
  /**
   * 舞台信息
   */
  stage: {
    width: 512,
    height: 512,
    backgroundColor: 0x282c34,
  },
};

export default GAME;
