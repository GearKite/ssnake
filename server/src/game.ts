import { Server } from "socket.io";
import { type Server as httpServerT } from "http";
import type { Player, Food } from "./types";
import { v4 as uuidv4 } from "uuid";
import { logger } from "./logger";

export class Game {
  socket: Server;
  players: Map<string, Player> = new Map();
  food: Map<string, Food> = new Map();
  socketIDToPlayerID: Map<string, string> = new Map();

  boardSizeX: number = 64;
  boardSizeY: number = 46;

  speed: number = 8;

  constructor(httpServer: httpServerT) {
    this.socket = new Server(httpServer);

    this.socket.on("connection", (client) => {
      logger.info(
        `Client ${client.id} connected from ${client.handshake.address}`
      );
      // Broadcast all player updates to every other player
      client.on("player join", () => {
        client.broadcast.emit("player join");
        client.emit("players", this.players);
        client.emit("food", Array.from(this.food.values()));
      });

      client.on("player update", (player: Player) => {
        if (!this.players.has(player.uuid))
          logger.info(
            `New player from ${client.id} joined as ${player.username}`
          );

        this.socketIDToPlayerID.set(client.id, player.uuid);
        if (this.validatePlayerUpdate(player)) {
          this.players.set(player.uuid, {
            ...this.players.get(player.uuid),
            ...player,
          });
          client.broadcast.emit("player update", player);
        } else {
          logger.info(`Invalid player update for: ${player.uuid}`);
          client.emit("player update", this.players.get(player.uuid));
        }
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

        logger.info(`Client ${client.id} left`);

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
        logger.debug(`Client ${client.id} sent event: ${event}`);
      });
    });

    setInterval(() => {
      this.loop();
    }, 1000);

    // Shrink a player every 60 seconds
    setInterval(() => {
      this.shrinkRandomPlayer();
    }, 60 * 1000);

    setInterval(() => {
      this.movePlayers();
    }, 1000 / this.speed);
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
    this.addFoodIfNeeded();
  }

  async shrinkRandomPlayer() {
    const player = this.getRandomPlayer();

    if (!player) return;

    if (player.body.length < 2) return;

    player.body.pop();
    const changed: Player = { uuid: player.uuid, body: player.body };
    const updated: Player = { ...player, ...changed };

    this.players.set(player.uuid, updated);

    this.socket.emit("player update", changed);

    if (Math.random() > 0.5)
      this.spawnFood(undefined, undefined, "player", player.color);
  }

  getRandomPlayer(): Player | undefined {
    const arr = Array.from(this.players.values());
    const index = Math.floor(Math.random() * arr.length);

    return arr[index];
  }

  async movePlayers() {
    this.players.forEach((player: Player, uuid: string) => {
      const updated = this.movePlayer(player);
      this.players.set(uuid, updated);
    });
  }

  movePlayer(player: Player) {
    /* eslint-disable indent */
    switch (player.facing) {
      case "left":
        player.position.x =
          (player.position.x + this.boardSizeX - 1) % (this.boardSizeX - 0);
        break;
      case "right":
        player.position.x =
          (player.position.x + this.boardSizeX + 1) % (this.boardSizeX - 0);
        break;
      case "up":
        player.position.y =
          (player.position.y + this.boardSizeY - 1) % (this.boardSizeY - 0);
        break;
      case "down":
        player.position.y =
          (player.position.y + this.boardSizeY + 1) % (this.boardSizeY - 0);
        break;
    }
    /* eslint-enable indent */
    return player;
  }

  checkCollisions(player: Player) {
    if (!player.position) return false;

    const hitOpponent = !Array.from(this.players.values()).every((opponent) => {
      if (opponent.uuid === player.uuid) return true;

      return opponent.body.every((segment) => {
        return !(
          player.position.x === segment.x && player.position.y === segment.y
        );
      });
    });

    return hitOpponent;
  }

  validatePlayerUpdate(received: Player): boolean {
    if (!this.players.has(received.uuid)) return true;

    const previous: Player = this.players.get(received.uuid);

    if (received.score && received.score > previous.score + 1) return false;

    if (received.body && received.body.length > previous.body.length + 1)
      return false;

    if (received.position) {
      if (this.calculateDistance(received.position, previous.position) >= 4) {
        return false;
      }
    }

    return true;
  }

  calculateDistance(p1: Player["position"], p2: Player["position"]) {
    // Calculate the difference in positions
    let dx = Math.abs(p1.x - p2.x);
    let dy = Math.abs(p1.y - p2.y);

    // Consider wrapping around the game
    dx = Math.min(dx, this.boardSizeX - dx);
    dy = Math.min(dy, this.boardSizeY - dy);

    // Apply the Pythagorean theorem to find the distance
    return Math.sqrt(dx * dx + dy * dy);
  }
}
