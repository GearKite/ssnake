import express from "express";
import { createServer } from "http";
import { Game } from "./game";

const app = express();
const port = process.env.PORT || 3000;

const http = createServer(app);

new Game(http);

app.use(function (req, res, next) {
  res.setHeader(
    "Content-Security-Policy",
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
  );
  next();
});

app.use(express.static("public"));

http.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
