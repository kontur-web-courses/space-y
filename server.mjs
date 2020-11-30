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
let auth = "auth"

app.use(express.static(path.join(rootDir, 'spa/build')));
app.use(express.json())
app.use(cookieParser());

app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false,
  });
});

app.get("/", (_, res) => {
  res.sendFile(path.join(rootDir, 'spa/build/index.html'));
});
/* 
app.get("/login", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false,
  });
}); */

app.get("/api/getUser", (req, res) => {
  const user = req.cookies[auth];
  res.json({username: user ?? null});
});

app.post("/api/login", (req, res) => {
  let userName = req.body.username
  res.cookie(auth, userName, { httpOnly: true, secure: true, sameSite: true });
  res.json({username: userName});
});

app.get("/api/logout", (req, res) => {
  res.clearCookie(auth);
  res.sendStatus(204);
});

app.get('*', (req, res, next) => {
  if (req.cookies[auth] === null || req.path !=='/login') {
    res.redirect('/login');
  }
  else {
    next();
  }
}, (_, res) => {
  res.sendFile(path.join(rootDir, 'spa/build/index.html'));
});

https.createServer({
  key: fs.readFileSync('./certs/server.key'),
  cert: fs.readFileSync('./certs/server.cert')
}, app).listen(port, () => {
  console.log(`App listening on port ${port}`);
});
