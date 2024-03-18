import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { Snake } from "$lib/game/snake";
import { Food } from "$lib/game/food";
import { JPTCCube } from "$lib/game/jptc";
import { type Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { type Player, type Position } from "$lib/game/player";

export class Game extends Scene {
  connection: { socket: Socket };
  uuid: string = uuidv4();

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

  opponents: Map<typeof this.uuid, Player> = new Map();
  opponentSnakes: Map<typeof this.uuid, Snake> = new Map();

  constructor() {
    super("Game");
  }

  create(connection: typeof this.connection) {
    this.connection = connection;

    this.camera = this.cameras.main;
    this.camera.zoom = 1;

    this.currentScore = 0;

    // Load saved hi-score
    this.hiScore = parseInt(localStorage.getItem("hiscore")!);
    if (Number.isNaN(this.hiScore)) {
      this.hiScore = 0;
    }

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
    this.snake = new Snake(
      this,
      false,
      this.gridCellsX / 2,
      this.gridCellsY / 2
    );

    // Add JPTC cube
    this.jptc = new JPTCCube(this);

    this.updateScore();

    this.listenForSocketEvents();

    window.addEventListener("beforeunload", (e) => {
      connection.socket.emit("player leave");
    });

    setInterval(() => {
      this.sendUpdate();
    }, 5000);

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
      this.connection.socket.emit("player leave");
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
    }

    this.snake.update(delta);
    this.jptc.update(delta);

    this.opponentSnakes.forEach((snake) => {
      snake.update(delta);
    });
  }

  updateScore() {
    if (this.currentScore > this.hiScore) {
      this.hiScore = this.currentScore;
      window.localStorage.setItem("hiscore", this.hiScore.toString());
    }
    this.scoreText.text = `Score: ${this.currentScore}     Hi-Score: ${this.hiScore}`;
  }

  changeScene() {
    this.scene.start("GameOver", { score: this.currentScore });
  }

  async listenForSocketEvents() {
    this.connection.socket.on("player update", (player) => {
      console.debug("Received player update", player);
      if (!this.opponentSnakes.has(player.uuid)) {
        this.addNewOpponent(player);
      }
      this.opponents.set(player.uuid, player);
      this.opponentSnakes.get(player.uuid)?.updateFromState(player);
    });

    this.connection.socket.on("player leave", (uuid) => {
      console.debug("Received player leave", uuid);

      const snake = this.opponentSnakes.get(uuid);
      snake!.isAlive = false;
      snake!.body.getChildren().forEach((child) => {
        child.destroy();
      });

      this.opponents.delete(uuid);
      this.opponentSnakes.delete(uuid);
    });
  }

  async addNewOpponent(player: Player) {
    this.opponentSnakes.set(
      player.uuid,
      new Snake(this, true, player.position.x, player.position.y, player.facing)
    );
  }

  createPlayerEvent() {
    let body: Array<Position> = [];
    this.snake.body.getChildren().forEach((child: any) => {
      body.push({
        x: child.x / this.gridCellSize,
        y: child.y / this.gridCellSize,
      });
    });

    const player = {
      uuid: this.uuid,
      score: this.currentScore,
      position: this.snake.headPosition,
      facing: this.snake.currentFacing,
      body: body,
    };

    return player;
  }

  async sendUpdate() {
    //console.log(this.socket.id);
    this.connection.socket.emit("player update", this.createPlayerEvent());
  }
}
