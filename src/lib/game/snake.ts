import type { Game } from "../../game/scenes/Game";

export class Snake {
  game: Game;
  headPosition: Phaser.Geom.Point;
  previousHeadPosition: Phaser.Geom.Point;
  head;
  facing: "left" | "right" | "up" | "down" = "right";
  isAlive: boolean = true;
  body: Phaser.GameObjects.Group;
  tail: Phaser.Math.Vector2;
  speed: number = 8; // cells per second
  movedAfterTurn: boolean = true;
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
    switch (this.facing) {
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

    console.log("Shifting");

    Phaser.Actions.ShiftPosition(
      this.body.getChildren(),
      this.headPosition.x * this.game.gridCellSize,
      this.headPosition.y * this.game.gridCellSize + this.game.scoreBarHeight,
      1,
      this.tail
    );

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
      console.log("Snake body got hit!");
      this.isAlive = false;
    }

    return bodyHit;
  }
  faceLeft() {
    if (this.facing !== "right") {
      this.facing = "left";
    }
  }
  faceRight() {
    if (this.facing !== "left") {
      this.facing = "right";
    }
  }
  faceUp() {
    if (this.facing !== "down") {
      this.facing = "up";
    }
  }
  faceDown() {
    if (this.facing !== "up") {
      this.facing = "down";
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
}
