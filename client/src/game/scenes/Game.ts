import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { Snake } from "$lib/game/snake";
import { Food, type FoodT } from "$lib/game/food";
import { JPTCCube } from "$lib/game/jptc";
import { type Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { type Player, type Position } from "$lib/game/player";
import randomColor from "randomcolor";

export class Game extends Scene {
  socket: Socket;
  uuid: string = uuidv4();

  camera: Phaser.Cameras.Scene2D.Camera;
  scoreText: Phaser.GameObjects.Text;

  currentScore: number;
  hiScore: number;
  diedBy: string;

  snake: Snake;
  food: Map<string, Food>;
  jptc: JPTCCube;

  controls: Phaser.Types.Input.Keyboard.CursorKeys;

  scoreBarHeight: number = 32;
  gridCellSize: number;
  gridCellsX: number;
  gridCellsY: number;

  opponents: Map<typeof this.uuid, Player>;
  opponentSnakes: Map<typeof this.uuid, Snake>;

  updateInterval: NodeJS.Timeout;

  constructor() {
    super("Game");
  }

  create(data: { socket: Socket; playerName: string }) {
    this.socket = data.socket;

    this.camera = this.cameras.main;
    this.camera.zoom = 1;

    this.currentScore = 0;

    this.food = new Map();
    this.opponents = new Map();
    this.opponentSnakes = new Map();

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

    // Create our snake
    this.snake = new Snake(
      this,
      false,
      Math.floor(Math.random() * this.gridCellsX),
      Math.floor(Math.random() * this.gridCellsY),
      data.playerName,
      parseInt(randomColor({ luminosity: "light" }).replace("#", ""), 16)
    );

    // Add JPTC cube
    this.jptc = new JPTCCube(this);

    this.updateScore();

    this.listenForSocketEvents();

    this.socket.emit("player join");
    this.sendUpdate();

    this.updateInterval = setInterval(() => {
      this.sendUpdate();
    }, 5000);

    EventBus.emit("current-scene-ready", this);

    window.addEventListener("beforeunload", (e) => {
      this.socket.emit("player leave");
    });

    this.events.once("shutdown", () => {
      clearInterval(this.updateInterval);
      this.socket.emit("player leave");
      this.socket.disconnect();
      this.socket.off();
    });
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
    this.scene.start("GameOver", {
      score: this.currentScore,
      diedBy: this.diedBy,
    });
  }

  async listenForSocketEvents() {
    // Send current state for new player
    this.socket.on("player join", () => {
      this.sendUpdate();
    });

    // Update state after disconnect
    this.socket.on("connect", () => {
      this.sendUpdate();
    });

    this.socket.on("player update", (player: Player) => {
      if (player.uuid === this.uuid) {
        // Update our own player
        this.snake.updateFromState(player);
        this.currentScore = player.score || this.currentScore;
      } else {
        if (!this.opponentSnakes.has(player.uuid)) {
          this.addNewOpponent(player);
        }
        this.opponents.set(player.uuid, player);
        this.opponentSnakes.get(player.uuid)?.updateFromState(player);
      }
    });

    this.socket.on("player leave", (uuid) => {
      console.debug("Received player leave", uuid);

      const snake = this.opponentSnakes.get(uuid);

      if (snake === undefined) {
        return;
      }

      snake.destroy();

      this.opponents.delete(uuid);
      this.opponentSnakes.delete(uuid);
    });

    this.socket.on("food", (data: Array<FoodT>) => {
      let existingFoodUUIDs: Array<string> = [];

      data.forEach((item) => {
        existingFoodUUIDs.push(item.uuid);
        if (!this.food.has(item.uuid)) {
          this.food.set(
            item.uuid,
            new Food(
              this,
              item.uuid,
              item.gridX,
              item.gridY,
              item.foodType,
              item.color
            )
          );
        }
      });

      // Remove non-existant food
      Array.from(this.food.keys()).forEach((uuid) => {
        if (existingFoodUUIDs.includes(uuid)) {
          return;
        }
        this.food.get(uuid)!.destroy();
        this.food.delete(uuid);
      });
    });
  }

  async addNewOpponent(player: Player) {
    if (!player.position || !player.username || !player.color) return;
    this.opponentSnakes.set(
      player.uuid,
      new Snake(
        this,
        true,
        player.position.x,
        player.position.y,
        player.username,
        player.color,
        player.facing
      )
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

    const player: Player = {
      uuid: this.uuid,
      username: this.snake.name,
      score: this.currentScore,
      position: this.snake.headPosition,
      facing: this.snake.currentFacing,
      body: body,
      color: this.snake.color,
    };

    return player;
  }

  async sendUpdate() {
    //console.log(this.socket.id);
    this.socket.emit("player update", this.createPlayerEvent());
  }
}
