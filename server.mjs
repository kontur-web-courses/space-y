import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fetch from "node-fetch";

class UserInfo {

}

const users = new Map();

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
  // console.log(1);
  if (!users.has(req.params.user)) {
    users.set(req.params.user, new UserInfo());
  }
  console.log(2);
  console.log(users);
  res.send(req.params.user);
});

app.all('*', function(req, res) {
  res.sendFile(path.join(rootDir, "/spa/build/index.html"));
});
