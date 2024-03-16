import { GameObjects, Scene } from "phaser";

import { EventBus } from "../EventBus";

export class MainMenu extends Scene {
  logo: GameObjects.Image;
  title: GameObjects.Text;
  playButton: GameObjects.Text;

  constructor() {
    super("MainMenu");
  }

  create() {
    this.cameras.main.setBackgroundColor(0x6b7aa1);

    this.logo = this.add.image(512, 150, "logo").setDepth(100);

    this.playButton = this.add
      .text(512, 460, "Play", {
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
}
