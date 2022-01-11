import * as PIXI from "pixi.js";
import {
  SpriteNames,
  StageConfig,
  AssetsItem,
  ContainLimit,
} from "@/config/game";
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
  /**
   * 攻击力范围
   */
  attackPower: number[];
  /**
   * 攻击间隔 毫秒
   */
  attackInterval: number;
}

export interface PlayerInfo {
  target?: Player;
  offsetX: number;
  offsetY: number;
  speed: number;
  health: number;
  curHealth: number;
  beingAttacked: boolean;
  die: boolean;
}

export interface TreasureInfo {
  target?: Treasure;
  hit: boolean;
}

export interface HealthBar {
  container: PIXI.Container;
  redBar: PIXI.Graphics;
}

export interface Message {
  full?: PIXI.Text;
  failText: string;
  victoryText: string;
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
    speed: 4,
    direction: 1,
    attackPower: [20, 50],
    attackInterval: 500,
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
    failText: "GAME OVER!",
    victoryText: "Victory!",
  };

  player: PlayerInfo = {
    target: undefined,
    offsetX: 0,
    offsetY: 0,
    speed: 2,
    health: 100,
    curHealth: 100,
    beingAttacked: false,
    die: false,
  };

  /**
   * 出口
   */
  door: Door;
  /**
   * 宝箱
   */
  treasure: TreasureInfo = {
    target: undefined,
    hit: false,
  };

  /**
   * 墙的厚度
   */
  wallThickness = 30;

  contain: ContainLimit;

  /**
   * 移动摇杆
   */
  joystickStart = false;

  victory = false;
  gameFail = false;

  constructor(ref: HTMLCanvasElement, cfg: GameConfig) {
    this.ref = ref;
    this.app = new PIXI.Application({ ...cfg, view: ref });
    this.assets = cfg.assets;
    this.resource = cfg.resource;
    this.spriteNames = cfg.spriteNames;
    this.monster.monsterNum = cfg.monsterNum;
    this.contain = cfg.contain;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.mainTextures = this.resource[this.assets.main.name].textures!;
    /**
     * 创建地牢
     */
    this.dungeon = new PIXI.Sprite(this.mainTextures[this.spriteNames.dungeon]);
    this.door = new Door({
      textures: this.mainTextures[this.spriteNames.door],
      id: 0,
    });
    this.door.sprite.position.set(this.wallThickness, 0);

    this.treasure.target = new Treasure({
      textures: this.mainTextures[this.spriteNames.treasure],
      id: 0,
    });

    this.treasure.target.sprite.position.set(
      this.app.view.width -
        this.treasure.target.sprite.width -
        this.wallThickness,
      this.app.view.height / 2 - this.treasure.target.sprite.height / 2
    );

    this.app.stage.addChild(this.gameScene);
    this.app.stage.addChild(this.gameUIScene);
    this.gameScene.addChild(this.dungeon);
    this.gameScene.addChild(this.door.sprite);
    this.gameScene.addChild(this.treasure.target.sprite);
    this.gameUIScene.addChild(this.gameMessage);

    this.createMonster(this.mainTextures[this.spriteNames.blob]);
    this.createHealthBar();
    this.createMessage(this.messages.victoryText);
    this.createPlayer(this.mainTextures[this.spriteNames.explorer]);

    this.app.ticker.add((delta) => this.ticker(delta));
  }

  /**
   * 生成怪物
   * @param textures 怪物的 `textures`
   * @returns
   */
  private createMonster(textures: PIXI.Texture<PIXI.Resource>) {
    for (const i of genArr(0, this.monster.monsterNum)) {
      const vy = randomNum(0, 1);
      const monster = new Monster({
        textures,
        id: i,
        vy: this.monster.speed * this.monster.direction * (vy ? -1 : 1),
      });
      const x =
        this.monster.spacing * i + this.monster.xOffset - this.wallThickness;
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
  private createMessage(text: string) {
    if (!this.messages.full) {
      const style = new PIXI.TextStyle({
        fontFamily: "Futura",
        fontSize: 64,
        fill: "white",
      });
      this.messages.full = new PIXI.Text(text, style);
      this.messages.full.visible = false;
      this.gameMessage.addChild(this.messages.full);
    } else {
      this.messages.full.text = text;
    }

    this.messages.full.anchor.set(0.5);
    this.messages.full.x = this.app.stage.width / 2;
    this.messages.full.y = this.app.stage.height / 2;
  }

  /**
   * 创建玩家
   * @param textures
   */
  private createPlayer(textures: PIXI.Texture<PIXI.Resource>) {
    this.player.target = new Player({ textures, id: 0 });
    this.player.target.sprite.position.set(
      this.wallThickness,
      this.app.view.height / 2 - this.player.target.sprite.height / 2
    );
    this.gameScene.addChild(this.player.target.sprite);
  }

  /**
   * 移动怪物
   */
  private monsterMove() {
    this.monster.list.forEach((monster) => {
      monster.sprite.y += monster.vy;
      const blobHitsWall = contain(monster.sprite, this.contain);

      if (blobHitsWall === Contain.top || blobHitsWall === Contain.bottom) {
        monster.vy *= -1;
      }

      /**
       * 碰撞检测
       */
      if (
        this.player.target &&
        hitTestRectangle(this.player.target, monster) &&
        !this.player.beingAttacked
      ) {
        this.player.beingAttacked = true;
        this.player.curHealth -= randomNum(
          this.monster.attackPower[1],
          this.monster.attackPower[0]
        );
        const hr = this.player.curHealth / this.player.health;
        this.healthBar.grapBar.width = this.healthBar.grapBar.width * hr;
        if (hr < 0) {
          this.healthBar.grapBar.width = 0;
          if (this.messages.full) {
            this.createMessage(this.messages.failText);
            this.messages.full.visible = true;
            this.player.target.sprite.visible = false;
            this.player.die = true;
            this.gameFail = true;
          }
        }

        setTimeout(() => {
          this.player.beingAttacked = false;
        }, this.monster.attackInterval);
      }
    });
  }

  setPlayerOffset(
    offsetX: number,
    offsetY: number
  ): { offsetX: number; offsetY: number } {
    this.player.offsetX = offsetX;
    this.player.offsetY = offsetY;
    return { offsetX: this.player.offsetX, offsetY: this.player.offsetY };
  }

  /**
   * 移动玩家
   * @param offsetX x 轴偏移量
   * @param offsetY y 轴偏移量
   * @returns
   */
  playerMove(offsetX: number, offsetY: number): Player | undefined {
    if (this.victory || this.gameFail) return;
    if (this.player.target && this.joystickStart) {
      const x = this.player.target.sprite.x + offsetX * this.player.speed;
      const y = this.player.target.sprite.y - offsetY * this.player.speed;
      const hitsWall = contain(this.player.target.sprite, this.contain);
      if (
        hitsWall === Contain.top ||
        hitsWall === Contain.right ||
        hitsWall === Contain.bottom ||
        hitsWall === Contain.left
      ) {
        return;
      }
      this.player.target.move(x, y);
      this.checkTreasure();
      this.checkDoor();
    }
    return this.player.target;
  }

  private checkTreasure() {
    if (!this.player.target || !this.treasure.target) return;
    if (this.treasure.hit && !this.player.die) {
      this.treasure.target.sprite.x = this.player.target.sprite.x;
      this.treasure.target.sprite.y = this.player.target.sprite.y;
      return;
    }
    if (hitTestRectangle(this.player.target, this.treasure.target)) {
      this.treasure.hit = true;
    }
  }
  private checkDoor() {
    if (!this.player.target) return;
    if (this.treasure.hit && hitTestRectangle(this.player.target, this.door)) {
      this.createMessage(this.messages.victoryText);
      if (this.messages.full) this.messages.full.visible = true;
      this.victory = true;
    }
  }

  private ticker(delta: number) {
    // console.log(delta);
    this.monsterMove();
    this.playerMove(this.player.offsetX, this.player.offsetY);
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

export class Sprite {
  sprite: PIXI.Sprite;
  /**
   * 对象的唯一标识
   */
  id: number;

  centerX = 0;
  centerY = 0;
  halfWidth = 0;
  halfHeight = 0;
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
  move(x: number, y: number): Sprite {
    this.sprite.x = x;
    this.sprite.y = y;
    return this;
  }
}

/**
 * 怪物
 */
export class Monster extends Sprite {
  vy = 0;
  constructor({
    textures,
    id,
    vy,
  }: {
    textures: PIXI.Texture<PIXI.Resource>;
    id: number;
    vy: number;
  }) {
    super({ textures, id });
    this.vy = vy;
  }
}

/**
 * 玩家
 */
export class Player extends Sprite {
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

export class Treasure extends Sprite {
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

export class Door extends Sprite {
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

export enum Contain {
  /**
   * 触碰到左边
   */
  left = "left",
  /**
   * 触碰到上边
   */
  top = "top",
  /**
   * 触碰到右边
   */
  right = "right",
  /**
   * 触碰到下边
   */
  bottom = "bottom",
}

/**
 * 边界检测
 * @param sprite
 * @param container
 * @returns
 */
export function contain(
  sprite: PIXI.Sprite,
  container: { x: number; y: number; width: number; height: number }
): Contain | undefined {
  //Left
  if (sprite.x < container.x) {
    sprite.x = container.x;
    return Contain.left;
  }

  //Top
  if (sprite.y < container.y) {
    sprite.y = container.y;
    return Contain.top;
  }

  //Right
  if (sprite.x + sprite.width > container.width) {
    sprite.x = container.width - sprite.width;
    return Contain.right;
  }

  //Bottom
  if (sprite.y + sprite.height > container.height) {
    sprite.y = container.height - sprite.height;
    return Contain.bottom;
  }
}

export function hitTestRectangle(r1: Sprite, r2: Sprite): boolean {
  //Define the variables we'll need to calculate
  let hit;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  r1.centerX = r1.sprite.x + r1.sprite.width / 2;
  r1.centerY = r1.sprite.y + r1.sprite.height / 2;
  r2.centerX = r2.sprite.x + r2.sprite.width / 2;
  r2.centerY = r2.sprite.y + r2.sprite.height / 2;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.sprite.width / 2;
  r1.halfHeight = r1.sprite.height / 2;
  r2.halfWidth = r2.sprite.width / 2;
  r2.halfHeight = r2.sprite.height / 2;

  //Calculate the distance vector between the sprites
  const vx = r1.centerX - r2.centerX;
  const vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  const combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  const combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {
    //A collision might be occurring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {
      //There's definitely a collision happening
      hit = true;
    } else {
      //There's no collision on the y axis
      hit = false;
    }
  } else {
    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
}
