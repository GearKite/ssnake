import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";
import MainMenuDOM from "$lib/scenes/MainMenu.svelte";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    this.cameras.main.setBackgroundColor(0x243c55);

    // Load main menu HTML
    let domElement = document.createElement("div");
    new MainMenuDOM({ target: domElement });

    const dom = this.add.dom(0, 0).setElement(domElement);
    dom.setOrigin(0, 0);

    EventBus.emit("current-scene-ready", this);
  }

  start_client() {
    this.scene.start("Game", { peer: peer });
  }
}
