export interface Position {
  x: number;
  y: number;
}

export interface Player {
  uuid: string;
  username: string;
  position: Position;
  score: number;
  body: Array<Position>;
}

export interface FoodLocation {
  uuid: string;
  gridX: number;
  gridY: number;
}
