import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class GameOver extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameOverText: Phaser.GameObjects.Text;
  playButton: Phaser.GameObjects.Text;

  constructor() {
    super("GameOver");
  }

  create(data: { score: number }) {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0xff0000);

    this.background = this.add.image(512, 384, "background");
    this.background.setAlpha(0.5);

    this.gameOverText = this.add
      .text(512, 384, "Game Over", {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.add
      .text(512, 484, `Score: ${data.score}`, {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.playButton = this.add
      .text(512, 600, "Try again", {
        fontFamily: "Arial Black",
        fontSize: 38,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        align: "center",
        backgroundColor: "#FFF767",
        padding: { x: 8, y: 8 },
      })
      .setOrigin(0.5)
      .setDepth(100)
      .setInteractive()
      .on("pointerdown", () => {
        this.scene.start("Game");
      })
      .on("pointerover", () => {
        this.playButton.setStyle({ backgroundColor: "#FFFFBF" });
      })
      .on("pointerout", () => {
        this.playButton.setStyle({ backgroundColor: "#FFF767" });
      });

    EventBus.emit("current-scene-ready", this);
  }

  changeScene() {
    this.scene.start("MainMenu");
  }
}
