export interface Position {
  x: number;
  y: number;
}

export interface Player {
  uuid: string;
  username?: string;
  position?: Position;
  score?: number;
  body?: Array<Position>;
  facing?: string;
  color?: number;
}

export interface Food {
  uuid: string;
  gridX: number;
  gridY: number;
  foodType: "player" | "natural";
  color: number;
}
