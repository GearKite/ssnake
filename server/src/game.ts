import { Server } from "socket.io";
import { type Server as httpServerT } from "http";
import type { Player, Food } from "./types";
import { v4 as uuidv4 } from "uuid";

export class Game {
  socket: Server;
  players: Map<string, Player> = new Map();
  food: Map<string, Food> = new Map();
  socketIDToPlayerID: Map<string, string> = new Map();

  boardSizeX: number = 64;
  boardSizeY: number = 46;

  constructor(httpServer: httpServerT) {
    this.socket = new Server(httpServer);

    setInterval(() => {
      this.loop();
    }, 1000);

    this.socket.on("connection", (client) => {
      console.log(
        `Client ${client.id} connected from ${client.handshake.address}`
      );
      // Broadcast all player updates to every other player
      client.on("player join", () => {
        client.broadcast.emit("player join");
        client.emit("players", this.players);
        client.emit("food", Array.from(this.food.values()));
      });

      client.on("player update", (player: Player) => {
        this.socketIDToPlayerID.set(client.id, player.uuid);
        this.players.set(player.uuid, player);
        client.broadcast.emit("player update", player);
      });

      // Client gracefully exits, sending a request
      client.on("player leave", () => {
        handlePlayerLeave(this);
      });

      // Client loses connection
      client.on("disconnect", () => {
        handlePlayerLeave(this);
      });

      async function handlePlayerLeave(server: Game) {
        if (!server.socketIDToPlayerID.has(client.id)) {
          return;
        }

        console.log(`Client ${client.id} left`);

        const uuid = server.socketIDToPlayerID.get(client.id);

        client.broadcast.emit("player leave", uuid);

        const player = server.players.get(uuid);

        player.body.forEach((position) => {
          // Spawn only ~50% of the food
          if (Math.random() > 0.5) return;

          server.spawnFood(position.x, position.y, "player", player.color);
        });

        client.broadcast.emit("food", Array.from(server.food.values()));

        server.players.delete(uuid);

        server.socketIDToPlayerID.delete(client.id);
      }

      client.on("food eat", (uuid) => {
        if (!this.food.has(uuid)) {
          return;
        }

        // Replace natural food
        if (this.food.get(uuid).foodType === "natural") this.spawnFood();

        this.food.delete(uuid);

        this.socket.emit("food", Array.from(this.food.values()));
      });

      client.onAny((event) => {
        console.debug(`Client ${client.id} sent event: ${event}`);
      });
    });
  }

  async addFoodIfNeeded() {
    if (this.players.size < this.food.size - 1) {
      return false;
    }

    this.spawnFood();

    this.socket.emit("food", Array.from(this.food.values()));

    return true;
  }

  async spawnFood(
    x: number = Math.floor(Math.random() * (this.boardSizeX - 1)),
    y: number = Math.floor(Math.random() * (this.boardSizeY - 1)),
    type: Food["foodType"] = "natural",
    color: number = 0xf1ef99
  ) {
    const uuid = uuidv4();
    this.food.set(uuid, {
      uuid: uuid,
      gridX: x,
      gridY: y,
      foodType: type,
      color: color,
    });
  }

  async loop() {
    await this.addFoodIfNeeded();
  }
}
