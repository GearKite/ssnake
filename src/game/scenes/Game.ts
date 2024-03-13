import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { Snake } from "$lib/game/snake";
import { Food } from "$lib/game/food";
import { JPTCCube } from "$lib/game/jptc";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  scoreText: Phaser.GameObjects.Text;

  currentScore: number;
  hiScore: number;

  snake: Snake;
  food: Food;
  jptc: JPTCCube;

  controls: Phaser.Types.Input.Keyboard.CursorKeys;

  scoreBarHeight: number = 32;
  gridCellSize: number;
  gridCellsX: number;
  gridCellsY: number;

  constructor() {
    super("Game");
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.zoom = 1;
    this.camera.setBackgroundColor(0x76abae);

    this.currentScore = 0;
    this.hiScore = 0;

    this.controls = this.input.keyboard!.createCursorKeys();

    this.gridCellSize = 16 / this.camera.zoom;
    this.gridCellsX = this.camera.width / this.gridCellSize;
    this.gridCellsY =
      (this.camera.height - this.scoreBarHeight) / this.gridCellSize;

    // Add background grid
    this.add
      .grid(
        this.camera.width / 2,
        this.camera.height / 2 + this.scoreBarHeight,
        this.camera.width,
        this.camera.height,
        this.gridCellSize,
        this.gridCellSize,
        0x222831
      )
      .setAltFillStyle(0x31363f)
      .setOutlineStyle();

    // Add score text
    this.scoreText = this.add
      .text(this.scoreBarHeight / 2, this.scoreBarHeight / 2, "", {
        fontFamily: "Arial Black",
        fontSize: this.scoreBarHeight - 8,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
      })
      .setOrigin(0, 0.5)
      .setDepth(100);

    // Create food and snake
    this.food = new Food(this);
    this.snake = new Snake(this, this.gridCellsX / 2, this.gridCellsY / 2);

    // Add JPTC cube
    this.jptc = new JPTCCube(this);

    this.updateScoreText();

    EventBus.emit("current-scene-ready", this);
  }

  preload() {
    JPTCCube.preload(this);
  }

  update(time: number, delta: number) {
    if (!this.snake) {
      return;
    }
    if (!this.snake.isAlive) {
      this.changeScene();
      return;
    }

    if (this.controls.left.isDown) {
      this.snake.faceLeft();
    } else if (this.controls.right.isDown) {
      this.snake.faceRight();
    } else if (this.controls.up.isDown) {
      this.snake.faceUp();
    } else if (this.controls.down.isDown) {
      this.snake.faceDown();
    } else if (this.controls.space.isDown) {
      this.snake.grow();
    }

    this.snake.update(delta);
    this.jptc.update(delta);
  }

  updateScoreText() {
    this.scoreText.text = `Score: ${this.currentScore}     Hi-Score: ${this.hiScore}`;
  }

  changeScene() {
    this.scene.start("GameOver");
  }
}
