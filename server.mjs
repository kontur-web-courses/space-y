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
const users = new Set();
const cookieOptions = {
    secret: "lol",
    signed: true,
    httpOnly: true,
    secure: true,
    sameSite: true
}

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

app.use(express.static('spa/build'));
app.use(cookieParser(cookieOptions.secret));

app.get('/*', (req, res) => {
  var username = req.cookie('username', cookieOptions);
  const options = {
    root: path.join('./spa/build')
  }
  if (!username)
    res.sendFile('index.html', options);
})

app.post('/api/login/:username', (req, res, next) => {
    var username = req.params.username;
    users.add(username);
    console.log(`added user: ${username}`);

    res.cookie('username', username, cookieOptions).send();
});

app.get('/api/logout', (req, res, next) => {
    var username = req.cookie('username', cookieOptions)

    if (username && users.has(username)) {
        users.delete(username);
        console.log(`logout user: ${username}`)
    }

    res.clearCookie('username');
    res.sendStatus(200);
});

app.get('/api/check', (req, res, next) => {
    var username = req.cookie('username', cookieOptions)
    console.log(`user ${username} checked`);
    if (username)
        res.send(username);
    else
        res.sendStatus(401);
});

https
    .createServer(
        {
          key: fs.readFileSync("./certs/server.key"),
          cert: fs.readFileSync("./certs/server.cert"),
        },
        app
    )
    .listen(3000, function () {
      console.log(
          "Example app listening on port 3000! Go to https://localhost:3000/"
      );
    });
