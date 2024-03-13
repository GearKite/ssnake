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
  }

  update(delta: number) {
    let xCenter = this.body.x;
    let yCenter = this.body.y;

    let halfW = this.body.width / 2;
    let halfH = this.body.height / 2;

    if (xCenter + halfW >= this.game.camera.width || xCenter - halfW <= 0) {
      this.body.setVelocityX(this.body.getVelocity().x * -1);
    }
    if (yCenter + halfH >= this.game.camera.height || yCenter - halfH <= 0) {
      this.body.setVelocityY(this.body.getVelocity().y * -1);
    }
  }
}
