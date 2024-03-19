import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { io } from "socket.io-client";
import GameOverDOM from "$lib/scenes/GameOver.svelte";

export class GameOver extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameOverText: Phaser.GameObjects.Text;
  playButton: Phaser.GameObjects.Text;

  constructor() {
    super("GameOver");
  }

  create(data: { score: number; server: string }) {
    this.cameras.main.setBackgroundColor(0x243c55);

    // Load main menu HTML
    let domElement = document.createElement("div");
    new GameOverDOM({
      target: domElement,
      props: {
        score: data.score,
        playAgain: () => {
          this.playAgain();
        },
        mainMenu: () => {
          this.changeScene();
        },
      },
    });

    const dom = this.add.dom(0, 0).setElement(domElement);
    dom.setOrigin(0, 0);

    EventBus.emit("current-scene-ready", this);
  }

  playAgain() {
    const server =
      window.localStorage.getItem("server") || window.location.host;

    const socket = io(server, {
      reconnectionAttempts: 5,
      reconnectionDelayMax: 10000,
    });
    socket.once("connect", () => {
      this.scene.start("Game", { socket: socket });
    });
  }

  changeScene() {
    this.scene.start("MainMenu");
  }
}
