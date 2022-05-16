import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const users = [];

const rootDir = process.cwd();
const port = 3000;
const app = express();
const parser = express.json();

app.use(express.static('spa/build'));
app.use(express.json());

https
  .createServer(
    {
      key: fs.readFileSync("certs/server.key", 'utf8'),
      cert: fs.readFileSync("certs/server.cert", 'utf8'),
    },
    app
  )
  .listen(3000, function () {
    console.log(
      "Example app listening on port 3000! Go to https://localhost:3000/"
    );
  });

app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false,
  });
});

app.get("/", (_, res) => {
  res.send(":)");
});


app.get("/api/login/:user", (req, res) => {
  users.push(req.params.user);
  console.log(users);
  res.send(req.params.user);
});

app.all('*', function(req, res) {
  res.sendFile(path.join(rootDir, "/spa/build/index.html"));
});
