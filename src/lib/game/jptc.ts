import type { Game } from "../../game/scenes/Game";

export class JPTCCube {
  body: Phaser.Physics.Matter.Image;
  game: Game;

  static preload(game: Game) {
    game.load.image("jptc", "assets/jptc.png");
  }

  constructor(game: Game) {
    this.game = game;

    game.matter.world.disableGravity();

    game.matter.add.mouseSpring();

    let x = 100;
    let y = 300;

    this.body = game.matter.add.image(x, y, "jptc");

    this.body.setDisplaySize(4 * game.gridCellSize, 4 * game.gridCellSize);
    this.body.setSize(4 * game.gridCellSize, 4 * game.gridCellSize);

    // Move the cube in a random direction
    this.body.setVelocity(Math.random() * 20 - 10, Math.random() * 20 - 10);
  }

  update(delta: number) {
    // Bounce the cube off walls
    if (this.body.x + this.body.width / 2 >= this.game.camera.width) {
      this.body.setVelocityX(this.body.getVelocity().x * -1);
      this.body.setX(this.game.camera.width - this.body.width / 2);
    } else if (this.body.x - this.body.width / 2 <= 0) {
      this.body.setVelocityX(this.body.getVelocity().x * -1);
      this.body.setX(this.body.width / 2);
    }
    if (this.body.y + this.body.height / 2 >= this.game.camera.height) {
      this.body.setVelocityY(this.body.getVelocity().y * -1);
      this.body.setY(this.game.camera.height - this.body.height / 2);
    } else if (this.body.y - this.body.height / 2 <= 0) {
      this.body.setVelocityY(this.body.getVelocity().y * -1);
      this.body.setY(this.body.height / 2);
    }
  }
}
