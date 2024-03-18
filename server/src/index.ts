import express from "express";
import { createServer } from "http";
import { Game } from "./game";

const app = express();
const port = process.env.PORT || 3000;

const http = createServer(app);

new Game(http);

app.get("/", (req, res) => {
  res.send("SSNAKE multiplayer server");
});

http.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
