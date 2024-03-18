import { Server } from "socket.io";
import { type Server as httpServerT } from "http";
import { type Player } from "./player";

interface Food {
  x: number;
  y: number;
}

export class Game {
  socket: Server;
  players: Map<string, Player> = new Map();
  food: Array<Food> = [];
  socketIDToPlayerID: Map<string, string> = new Map();

  constructor(httpServer: httpServerT) {
    this.socket = new Server(httpServer);

    this.socket.on("connection", (client) => {
      console.log(
        `Client ${client.id} connected from ${client.handshake.address}`
      );
      client.emit("players", this.players);
      client.emit("food", this.food);

      // Broadcast all player updates to every other player
      client.on("player join", () => {
        client.broadcast.emit("player join");
      });

      client.on("player update", (player) => {
        this.socketIDToPlayerID.set(client.id, player.uuid);
        this.players.set(player.uuid, player);
        client.broadcast.emit("player update", player);
      });

      client.on("player leave", () => {
        handlePlayerLeave(this);
      });

      client.on("disconnect", () => {
        handlePlayerLeave(this);
      });

      async function handlePlayerLeave(server: Game) {
        if (!server.socketIDToPlayerID.has(client.id)) {
          return;
        }

        console.log(`Client ${client.id} left`);

        client.broadcast.emit(
          "player leave",
          server.socketIDToPlayerID.get(client.id)
        );

        server.socketIDToPlayerID.delete(client.id);
      }

      client.onAny((event) => {
        console.log(`Client ${client.id} sent event: ${event}`);
      });
    });
  }
}
