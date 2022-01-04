import * as PIXI from "pixi.js";
import { SpriteNames, StageConfig, AssetsItem } from "@/config/game";
import { Adaptation } from "@/scripts/adaptation";
import { genArr, randomNum } from "@/utils";

export interface GameConfig extends StageConfig {
  resource: PIXI.utils.Dict<PIXI.LoaderResource>;
  assets: Assets;
  spriteNames: SpriteNames;
  monsterNum: number;
}

export interface Assets {
  main: AssetsItem;
}

export interface MonsterInfo {
  /**
   * 怪物集合
   */
  list: Monster[];
  /**
   * 水平间隔
   */
  spacing: number;
  /**
   * 开始的位移
   */
  xOffset: number;
  /**
   * 怪物数量
   */
  monsterNum: number;
  /**
   * 怪物的移动速度
   */
  speed: number;
  /**
   * 怪物的移动方向
   */
  direction: number;
}

export interface HealthBar {
  container: PIXI.Container;
  redBar: PIXI.Graphics;
}

export interface Message {
  full?: PIXI.Text;
}

/**
 * 游戏主类
 */
export class Game {
  app: PIXI.Application;
  adap: Adaptation | null = null;
  /**
   * canvas DOM对象
   */
  ref: HTMLCanvasElement;
  /**
   * 资源
   */
  assets: Assets;
  /**
   * 资源名称
   */
  spriteNames: SpriteNames;
  /**
   * 资源缓存
   */
  resource: PIXI.utils.Dict<PIXI.LoaderResource>;
  /**
   * 游戏场景容器
   */
  gameScene = new PIXI.Container();
  /**
   * 游戏UI容器
   */
  gameUIScene = new PIXI.Container();

  /**
   * 游戏消息容器
   */
  gameMessage = new PIXI.Container();
  /**
   * 地牢
   */
  dungeon: PIXI.Sprite;

  mainTextures: {
    [name: string]: PIXI.Texture<PIXI.Resource>;
  };

  /**
   * 游戏怪物信息
   */
  monster: MonsterInfo = {
    list: [],
    spacing: 48,
    xOffset: 150,
    monsterNum: 6,
    speed: 2,
    direction: 1,
  };

  /**
   * 血条
   */
  healthBar = {
    container: new PIXI.Container(),
    grapBar: new PIXI.Graphics(),
  };

  /**
   * 游戏消息
   */
  messages: Message = {
    full: undefined,
  };

  player: Player | undefined;

  /**
   * 出口
   */
  door: PIXI.Sprite;
  /**
   * 宝箱
   */
  treasure: PIXI.Sprite;

  /**
   * 墙的厚度
   */
  wallThickness = 30;

  constructor(ref: HTMLCanvasElement, cfg: GameConfig) {
    this.ref = ref;
    this.app = new PIXI.Application({ ...cfg, view: ref });
    this.assets = cfg.assets;
    this.resource = cfg.resource;
    this.spriteNames = cfg.spriteNames;
    this.monster.monsterNum = cfg.monsterNum;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.mainTextures = this.resource[this.assets.main.name].textures!;
    /**
     * 创建地牢
     */
    this.dungeon = new PIXI.Sprite(this.mainTextures[this.spriteNames.dungeon]);
    this.door = new PIXI.Sprite(this.mainTextures[this.spriteNames.door]);
    this.door.position.set(this.wallThickness, 0);
    this.treasure = new PIXI.Sprite(
      this.mainTextures[this.spriteNames.treasure]
    );
    console.log(this.app);

    this.treasure.position.set(
      this.app.view.width - this.treasure.width - this.wallThickness,
      this.app.view.height / 2 - this.treasure.height / 2
    );

    this.app.stage.addChild(this.gameScene);
    this.app.stage.addChild(this.gameUIScene);
    this.gameScene.addChild(this.dungeon);
    this.gameScene.addChild(this.door);
    this.gameScene.addChild(this.treasure);
    this.gameUIScene.addChild(this.gameMessage);

    this.createMonster(this.mainTextures[this.spriteNames.blob]);
    this.createHealthBar();
    this.createMessage();
    this.createPlayer(this.mainTextures[this.spriteNames.explorer]);
  }

  /**
   * 生成怪物
   * @param textures 怪物的 `textures`
   * @returns
   */
  private createMonster(textures: PIXI.Texture<PIXI.Resource>) {
    for (const i of genArr(0, this.monster.monsterNum)) {
      const monster = new Monster({ textures, id: i });
      const x = this.monster.spacing * i + this.monster.xOffset;
      const y = randomNum(
        this.wallThickness,
        this.app.stage.height - monster.sprite.height - this.wallThickness
      );
      monster.move(x, y);
      this.monster.list.push(monster);
      this.gameScene.addChild(monster.sprite);
    }
    return this.monster;
  }

  /**
   * 创建血条
   */
  private createHealthBar() {
    this.healthBar.container.position.set(this.app.stage.width - 170, 4);
    this.gameUIScene.addChild(this.healthBar.container);

    /**
     * 黑色矩形背景
     */
    const innerBar = new PIXI.Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 128, 8);
    innerBar.endFill();
    this.healthBar.container.addChild(innerBar);

    /**
     * 红色矩形
     */
    this.healthBar.grapBar = new PIXI.Graphics();
    this.healthBar.grapBar.beginFill(0xff3300);
    this.healthBar.grapBar.drawRect(0, 0, 128, 8);
    this.healthBar.grapBar.endFill();
    this.healthBar.container.addChild(this.healthBar.grapBar);
    return this.healthBar;
  }

  /**
   * 创建游戏信息
   */
  private createMessage() {
    const style = new PIXI.TextStyle({
      fontFamily: "Futura",
      fontSize: 64,
      fill: "white",
    });
    this.messages.full = new PIXI.Text("The End!", style);
    this.messages.full.x = 120;
    this.messages.full.y = this.app.stage.height / 2 - 32;
    this.messages.full.visible = false;
    this.gameMessage.addChild(this.messages.full);
  }

  /**
   * 创建玩家
   * @param textures
   */
  private createPlayer(textures: PIXI.Texture<PIXI.Resource>) {
    this.player = new Player({ textures, id: 0 });
    this.player.sprite.position.set(
      this.wallThickness,
      this.app.view.height / 2 - this.player.sprite.height / 2
    );
    this.gameScene.addChild(this.player.sprite);
  }

  /**
   * 适配容器宽高
   * @param container 容器
   * @param target 目标元素
   * @returns
   */
  adaptation(container: HTMLElement): Adaptation {
    this.adap = new Adaptation(
      {
        width: container.offsetWidth,
        height: container.offsetHeight,
      },
      {
        width: this.ref.offsetWidth,
        height: this.ref.offsetHeight,
      }
    );
    return this.adap;
  }
}

export class Animal {
  sprite: PIXI.Sprite;
  /**
   * 对象的唯一标识
   */
  id: number;
  constructor({
    textures,
    id,
  }: {
    textures: PIXI.Texture<PIXI.Resource>;
    id: number;
  }) {
    this.sprite = new PIXI.Sprite(textures);
    this.id = id;
  }

  /**
   * 移动
   * @param x x轴偏移距离
   * @param y y轴偏移距离
   * @returns
   */
  move(x: number, y: number): Monster {
    this.sprite.x = x;
    this.sprite.y = y;
    return this;
  }
}

/**
 * 怪物
 */
export class Monster extends Animal {
  constructor({
    textures,
    id,
  }: {
    textures: PIXI.Texture<PIXI.Resource>;
    id: number;
  }) {
    super({ textures, id });
  }
}

/**
 * 玩家
 */
export class Player extends Animal {
  constructor({
    textures,
    id,
  }: {
    textures: PIXI.Texture<PIXI.Resource>;
    id: number;
  }) {
    super({ textures, id });
  }
}
