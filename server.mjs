import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const rootDir = process.cwd();
const port = 3000;
const securePort = 3030;
const usernameCookie = 'username'
const app = express();

app.use(express.static(path.join(rootDir, 'spa/build')));
app.use(express.json());
app.use(cookieParser());

const checkLogin = function (req, res, next) {
  let user = req.cookies[usernameCookie];
  if (user || req.path === '/login') {
    next();
  } else {
    res.redirect('/login');
  }
}

app.get('/api/user', (req, res) => {
  const user = req.cookies[usernameCookie];
  res.json({ username: user ?? null });
});

app.post('/api/user', (req, res) => {
  const { username } = req.body;
  res.cookie(usernameCookie, username, { httpOnly: true, secure: true, sameSite: 'strict' });
  res.json({ username: username ?? null });
});

app.delete('/api/user', (req, res) => {
  res.clearCookie(usernameCookie);
  res.status(200).end();
});

app.get('/api/*', async (req, res) => {
  if (!req.cookies.username) {
    return res.sendStatus(403);
  }
  const originalPath = req.path.replace("/api", '');
  const proxy = await fetch(`https://api.spacexdata.com/v3${originalPath}`);
  if (proxy.ok) {
    proxy.body.pipe(res);
  }
  else res.sendStatus(503);
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

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

app.get('*', checkLogin, function (req, res) {
  res.sendFile(path.join(rootDir, 'spa/build/index.html'));
});

https.createServer({
  key: fs.readFileSync('certs/server.key'),
  cert: fs.readFileSync('certs/server.cert')
}, app)
  .listen(securePort, function () { console.log(`Secure App listening on port ${securePort}`) })