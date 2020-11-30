import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import { Console } from "console";

const rootDir = process.cwd();
const port = 3000;
const app = express();
const loginUrl = '/login';

const checkSession = (req, res, next) => {
  const user = req.cookies.username;
  if (user || req.path === loginUrl) {
    next();
  }
  else res.redirect(loginUrl);
};

app.use(cookieParser());
app.use(express.json());

app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false,
  });
});

app.get('/api/user', (req, res) => {
  const user = req.cookies.username;
  res.json({ user: user ?? null });
});

app.post('/api/user', (req, res) => {
  const { user } = req.body;
  res.cookie('username', user, { httpOnly: true, secure: true, sameSite: 'strict' });
  res.json({ user: user });
});

app.delete('/api/user', (req, res) => {
  res.clearCookie('username');
  res.sendStatus(200);
});

app.get('/api/*', async (req, res) => {
  if (!req.cookies.username) {
    return res.sendStatus(403);
  }
  const originalPath = req.path.replace("/api", '');
  const proxy = await fetch(`https://api.spacexdata.com/v3${originalPath}`);
  if (proxy.ok) {
    // const data = await proxy.json();
    // proxy.json(data);
    proxy.body.pipe(res);
  }
  else res.sendStatus(503);
});

app.use(express.static(path.join(rootDir, 'spa/build')));

app.get('*', checkSession, (_, res) => {
  res.sendFile(path.join(rootDir, 'spa/build/index.html'));
});

https
  .createServer(
    {
      key: fs.readFileSync('certs/server.key'),
      cert: fs.readFileSync('certs/server.cert')
    }, app)
  .listen(port, () => {
    console.log(`App listening on port ${port}`);
  });