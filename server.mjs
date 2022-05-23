import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const rootDir = process.cwd();
const port = 3000;
const app = express();

const db = new Set();

app.use(express.static(path.join(rootDir, "spa", "build")));
app.use(cookieParser());

app.post("/api/users/login", (req, res) => {
  const username = req.query.username;
  db.add(username);
  res.cookie("username", username);
  res.send(username);
});

app.post("/api/users/logout", (req, res) => {
  const username = req.cookies.username;
  db.delete(username);
  delete res.cookies.username
});

app.get("/api/users", (req, res) => {
  const username = req.cookies.username;
  const result = { username: null };

  if (username != undefined) {
    res.cookie("username", username);
    result.username = username;
  }

  res.send(result);
});

app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false
  });
});

app.get("*", (_, res) => {
  res.sendFile(path.join(rootDir, "spa", "build", "index.html"));
});

https.createServer(
  {
    key: fs.readFileSync(path.join(rootDir, "certs", "server.key")),
    cert: fs.readFileSync(path.join(rootDir, "certs", "server.cert"))
  },
  app
).listen(port, () => {
  console.log(`App listening on port ${port}`);
});
