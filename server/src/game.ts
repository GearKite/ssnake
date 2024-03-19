import { Server } from "socket.io";
import { type Server as httpServerT } from "http";
import type { Player, FoodLocation } from "./types";
import { v4 as uuidv4 } from "uuid";

export class Game {
  socket: Server;
  players: Map<string, Player> = new Map();
  food: Map<string, FoodLocation> = new Map();
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

        server.players.delete(uuid);

        server.socketIDToPlayerID.delete(client.id);
      }

      client.on("food eat", (uuid) => {
        if (!this.food.has(uuid)) {
          return;
        }
        this.food.delete(uuid);

        if (!this.addFoodIfNeeded()) {
          this.socket.emit("food", Array.from(this.food.values()));
        }
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

    const uuid = uuidv4();
    this.food.set(uuid, {
      uuid: uuid,
      gridX: Math.floor(Math.random() * (this.boardSizeX - 1)),
      gridY: Math.floor(Math.random() * (this.boardSizeY - 1)),
    });

    this.socket.emit("food", Array.from(this.food.values()));

    return true;
  }

  async loop() {
    await this.addFoodIfNeeded();
  }
}
