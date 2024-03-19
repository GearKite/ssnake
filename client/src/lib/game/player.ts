export interface Position {
  x: number;
  y: number;
}

export enum SnakeFacing {
  "left" = "left",
  "right" = "right",
  "up" = "up",
  "down" = "down",
}

export interface Player {
  uuid: string;
  username: string;
  position: Position;
  score: number;
  body: Array<Position>;
  facing: SnakeFacing;
  color: number;
}
