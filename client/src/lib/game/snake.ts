import type { Game } from "../../game/scenes/Game";
import { SnakeFacing, type Player } from "$lib/game/player";

export class Snake {
  game: Game;
  headPosition: Phaser.Geom.Point;
  previousHeadPosition: Phaser.Geom.Point;
  head;
  currentFacing: SnakeFacing;
  previousFacing: SnakeFacing;
  isAlive: boolean = true;
  body: Phaser.GameObjects.Group;
  tail: Phaser.Math.Vector2;
  speed: number = 8;
  timeUntilNextMove: number = 0;
  tailPositions: Array<Phaser.Geom.Point>;
  puppet: boolean;

  constructor(
    scene: Game,
    puppet: boolean,
    x: number,
    y: number,
    facing?: SnakeFacing
  ) {
    this.game = scene;
    this.puppet = puppet;

    this.currentFacing = facing || SnakeFacing.right;

    this.headPosition = new Phaser.Geom.Point(x, y);
    this.previousHeadPosition = structuredClone(this.headPosition);

    this.body = scene.add.group();

    let headRectangle = new Phaser.GameObjects.Rectangle(
      scene,
      x * this.game.gridCellSize,
      y * this.game.gridCellSize,
      this.game.gridCellSize,
      this.game.gridCellSize,
      0xd37676
    );
    this.head = this.body.add(headRectangle, true);
    this.head.setOrigin(0);

    this.tail = new Phaser.Math.Vector2(x, y);
  }

  update(delta: number) {
    if (!this.isAlive) {
      return;
    }
    this.move(delta);
  }

  move(delta: number) {
    if (!this.isAlive) {
      return;
    }
    if (this.timeUntilNextMove - delta > 0) {
      this.timeUntilNextMove = this.timeUntilNextMove - delta;
      return;
    }
    this.timeUntilNextMove = 1000 / this.speed;

    switch (this.currentFacing) {
      case SnakeFacing.left:
        this.headPosition.x = Phaser.Math.Wrap(
          this.headPosition.x - 1,
          0,
          this.game.gridCellsX
        );
        break;
      case SnakeFacing.right:
        this.headPosition.x = Phaser.Math.Wrap(
          this.headPosition.x + 1,
          0,
          this.game.gridCellsX
        );
        break;
      case SnakeFacing.up:
        this.headPosition.y = Phaser.Math.Wrap(
          this.headPosition.y - 1,
          0,
          this.game.gridCellsY
        );
        break;
      case SnakeFacing.down:
        this.headPosition.y = Phaser.Math.Wrap(
          this.headPosition.y + 1,
          0,
          this.game.gridCellsY
        );
        break;
    }

    if (this.currentFacing !== this.previousFacing) {
      this.previousFacing = this.currentFacing;
    }

    // Update tail
    Phaser.Actions.ShiftPosition(
      this.body.getChildren(),
      this.headPosition.x * this.game.gridCellSize,
      this.headPosition.y * this.game.gridCellSize + this.game.scoreBarHeight,
      1,
      this.tail
    );

    if (this.puppet) {
      return true;
    }

    this.checkIfFoodEaten();

    let bodyHit = Phaser.Actions.GetFirst(
      this.body.getChildren(),
      {
        x: this.headPosition.x * this.game.gridCellSize,
        y:
          this.headPosition.y * this.game.gridCellSize +
          this.game.scoreBarHeight,
      },
      1
    );

    if (bodyHit) {
      this.isAlive = false;
    }

    return bodyHit;
  }
  faceLeft() {
    if (
      this.currentFacing !== SnakeFacing.right &&
      this.previousFacing !== SnakeFacing.right &&
      this.currentFacing !== SnakeFacing.left
    ) {
      this.currentFacing = SnakeFacing.left;
      this.sendUpdate();
    }
  }
  faceRight() {
    if (
      this.currentFacing !== SnakeFacing.left &&
      this.previousFacing !== SnakeFacing.left &&
      this.currentFacing !== SnakeFacing.right
    ) {
      this.currentFacing = SnakeFacing.right;
      this.sendUpdate();
    }
  }
  faceUp() {
    if (
      this.currentFacing !== SnakeFacing.down &&
      this.previousFacing !== SnakeFacing.down &&
      this.currentFacing !== SnakeFacing.up
    ) {
      this.currentFacing = SnakeFacing.up;
      this.sendUpdate();
    }
  }
  faceDown() {
    if (
      this.currentFacing !== SnakeFacing.up &&
      this.previousFacing !== SnakeFacing.up &&
      this.currentFacing !== SnakeFacing.down
    ) {
      this.currentFacing = SnakeFacing.down;
      this.sendUpdate();
    }
  }

  grow(x?: number, y?: number) {
    let tailRectangle = new Phaser.GameObjects.Rectangle(
      this.game,
      x || this.tail.x,
      y || this.tail.y,
      this.game.gridCellSize,
      this.game.gridCellSize,
      0xebc49f
    );
    tailRectangle.setOrigin(0);
    this.body.add(tailRectangle, true);

    this.sendUpdate();
  }

  checkIfFoodEaten() {
    this.game.food.forEach((food, uuid) => {
      let hit =
        this.headPosition.x === food.gridX &&
        this.headPosition.y === food.gridY;

      if (hit) {
        this.grow();
        food.eatFood();
      }
    });
  }

  sendUpdate() {
    if (this.puppet) {
      return;
    }
    this.game.sendUpdate();
  }

  async updateFromState(state: Player) {
    if (!this.isAlive) {
      return;
    }

    this.currentFacing = state.facing;

    this.headPosition.setTo(state.position.x, state.position.y);

    state.body.forEach((position, index) => {
      if (index >= this.body.getLength()) {
        this.grow(position.x, position.y);
      }
    });

    const body: Array<any> = this.body.getChildren();

    state.body.forEach((position, index) => {
      body[index].setX(position.x * this.game.gridCellSize);
      body[index].setY(position.y * this.game.gridCellSize);
    });
  }

  destroy() {
    // Destroy snake (on death)
    this.isAlive = false;

    this.body.getChildren().forEach((child) => {
      this.body.killAndHide(child);
    });
  }
}
