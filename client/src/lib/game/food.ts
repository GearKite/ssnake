import type { Game } from "../../game/scenes/Game";

export interface FoodLocation {
  uuid: string;
  gridX: number;
  gridY: number;
}

export class Food extends Phaser.GameObjects.Rectangle implements FoodLocation {
  game: Game;

  uuid: string;
  gridX: number;
  gridY: number;

  constructor(scene: Game, uuid: string, x: number, y: number) {
    super(scene, 0, 0);

    this.game = scene;

    this.setOrigin(0, 0);
    this.setFillStyle(0xf1ef99);
    this.setSize(this.game.gridCellSize, this.game.gridCellSize);

    this.uuid = uuid;
    this.gridX = x;
    this.gridY = y;

    this.setPosition(
      this.gridX * this.game.gridCellSize,
      this.gridY * this.game.gridCellSize + this.game.scoreBarHeight
    );

    scene.children.add(this);
  }

  moveFood() {
    // Move food to a random position on the grid
    this.gridX = Math.floor(Math.random() * (this.game.gridCellsX - 1));
    this.gridY = Math.floor(Math.random() * (this.game.gridCellsY - 1));
    this.setPosition(
      this.gridX * this.game.gridCellSize,
      this.gridY * this.game.gridCellSize + this.game.scoreBarHeight
    );
  }

  eatFood() {
    this.game.socket.emit("food eat", this.uuid);
    this.game.currentScore += 1;
    this.game.updateScore();
    this.destroy(true);
  }
}
