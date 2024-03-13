import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import Phaser from "phaser";
import { Preloader } from "./scenes/Preloader";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: "game-container",
  backgroundColor: "#028af8",
  scene: [Boot, Preloader, MainMenu, MainGame, GameOver],
  fps: {
    deltaHistory: 1,
    smoothStep: false,
  },
  physics: {
    default: "matter",
    matter: {
      enableSleeping: true,
    },
  },
};

const StartGame = (parent: string) => {
  return new Phaser.Game({ ...gameConfig, parent: parent });
};

export default StartGame;
