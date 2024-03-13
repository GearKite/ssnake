import type { Game } from "../../game/scenes/Game";

export class Food extends Phaser.GameObjects.Rectangle {
  game: Game;

  constructor(scene: Game) {
    super(scene, 0, 0);

    this.game = scene;

    this.setOrigin(0, 0);
    this.setFillStyle(0xf1ef99);
    this.setSize(this.game.gridCellSize, this.game.gridCellSize);

    this.moveFood();

    scene.children.add(this);
  }

  moveFood() {
    // Move food to a random position on the grid
    const x = Math.floor(Math.random() * (this.game.gridCellsX - 1));
    const y = Math.floor(Math.random() * (this.game.gridCellsY - 1));
    this.setPosition(
      x * this.game.gridCellSize,
      y * this.game.gridCellSize + this.game.scoreBarHeight
    );
  }

  eatFood() {
    this.game.currentScore += 1;
    this.game.updateScoreText();
  }
}
