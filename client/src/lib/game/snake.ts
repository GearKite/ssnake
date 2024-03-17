import type { Game } from "../../game/scenes/Game";

export class Snake {
  game: Game;
  headPosition: Phaser.Geom.Point;
  previousHeadPosition: Phaser.Geom.Point;
  head;
  currentFacing: "left" | "right" | "up" | "down" = "right";
  previousFacing: typeof this.currentFacing;
  isAlive: boolean = true;
  body: Phaser.GameObjects.Group;
  tail: Phaser.Math.Vector2;
  speed: number;
  timeUntilNextMove: number = 0;

  constructor(scene: Game, x: number, y: number) {
    this.game = scene;

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
    if (this.timeUntilNextMove - delta > 0) {
      this.timeUntilNextMove = this.timeUntilNextMove - delta;
      return;
    }
    this.timeUntilNextMove = 1000 / this.speed;

    switch (this.currentFacing) {
      case "left":
        this.headPosition.x = Phaser.Math.Wrap(
          this.headPosition.x - 1,
          0,
          this.game.gridCellsX
        );
        break;
      case "right":
        this.headPosition.x = Phaser.Math.Wrap(
          this.headPosition.x + 1,
          0,
          this.game.gridCellsX
        );
        break;
      case "up":
        this.headPosition.y = Phaser.Math.Wrap(
          this.headPosition.y - 1,
          0,
          this.game.gridCellsY
        );
        break;
      case "down":
        this.headPosition.y = Phaser.Math.Wrap(
          this.headPosition.y + 1,
          0,
          this.game.gridCellsY
        );
        break;
    }

    this.previousFacing = this.currentFacing;

    // Update tail
    Phaser.Actions.ShiftPosition(
      this.body.getChildren(),
      this.headPosition.x * this.game.gridCellSize,
      this.headPosition.y * this.game.gridCellSize + this.game.scoreBarHeight,
      1,
      this.tail
    );

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
    if (this.currentFacing !== "right" && this.previousFacing !== "right") {
      this.currentFacing = "left";
    }
  }
  faceRight() {
    if (this.currentFacing !== "left" && this.previousFacing !== "left") {
      this.currentFacing = "right";
    }
  }
  faceUp() {
    if (this.currentFacing !== "down" && this.previousFacing !== "down") {
      this.currentFacing = "up";
    }
  }
  faceDown() {
    if (this.currentFacing !== "up" && this.previousFacing !== "up") {
      this.currentFacing = "down";
    }
  }

  grow() {
    let tailRectangle = new Phaser.GameObjects.Rectangle(
      this.game,
      this.tail.x * this.game.gridCellSize,
      this.tail.y * this.game.gridCellSize + this.game.scoreBarHeight,
      this.game.gridCellSize,
      this.game.gridCellSize,
      0xebc49f
    );
    tailRectangle.setOrigin(0);
    this.body.add(tailRectangle, true);
  }

  checkIfFoodEaten() {
    let hit =
      this.headPosition.x === this.game.food.gridX &&
      this.headPosition.y === this.game.food.gridY;

    if (hit) {
      this.grow();
      this.game.food.eatFood();
    }
  }
}
