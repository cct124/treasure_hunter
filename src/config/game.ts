export interface StageConfig {
  width: number;
  height: number;
  backgroundColor: number;
}

/**
 * 资源信息
 */
export interface AssetsItem {
  path: string;
  name: AssetsConfig;
}

export interface SpriteNames {
  dungeon: AssetsConfig;
  blob: AssetsConfig;
}

export interface GameConfig {
  /**
   * 游戏资源信息
   */
  assets: {
    main: AssetsItem;
  };
  spriteNames: SpriteNames;
  /**
   * 舞台信息
   */
  stage: StageConfig;
}

/**
 * 资源枚举
 */
export enum AssetsConfig {
  /**
   * 游戏资源名
   */
  treasureHunter = "treasure_hunter",
  dungeon = "dungeon.png",
  blob = "blob.png",
}

/**
 * 游戏配置信息
 */
const GAME: GameConfig = {
  assets: {
    main: {
      path: "./treasure_hunter.json",
      name: AssetsConfig.treasureHunter,
    },
  },
  spriteNames: {
    dungeon: AssetsConfig.dungeon,
    blob: AssetsConfig.blob,
  },
  stage: {
    width: 512,
    height: 512,
    backgroundColor: 0x282c34,
  },
};

export default GAME;
