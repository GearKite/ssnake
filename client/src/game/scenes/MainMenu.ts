import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { io } from "socket.io-client";
import MainMenuDOM from "$lib/scenes/MainMenu.svelte";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    this.cameras.main.setBackgroundColor(0x243c55);

    // Load main menu HTML
    let domElement = document.createElement("div");
    new MainMenuDOM({
      target: domElement,
      props: {
        joinGame: (server: string) => {
          this.joinGame(server);
        },
      },
    });

    const dom = this.add.dom(0, 0).setElement(domElement);
    dom.setOrigin(0, 0);

    EventBus.emit("current-scene-ready", this);
  }

  joinGame(server: string) {
    const socket = io(server, {
      reconnectionAttempts: 5,
      reconnectionDelayMax: 10000,
    });
    socket.once("connect", () => {
      this.scene.start("Game", { socket: socket });
    });
  }
}
