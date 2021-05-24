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

app.use(express.static('spa/build'))
app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

app.get("*", (req, res) => {
  res.sendFile(path.join(rootDir, '/spa/build/index.html'));
})

app.get('/api/user', (req, res) => {
  const userName = req.cookies['username'];
  res.send(userName);
})

app.post('/api/user', (req, res) => {
  const userName = req.query.user;
  res.cookie("username", userName,{httpOnly: true,secure: true, sameSite:'strict'});
})

app.delete("/api/user", (req, res) => {
  res.clearCookie('username');
});

https.createServer({
  key: fs.readFileSync('certs/server.key'),
  cert: fs.readFileSync('certs/server.cert')
}, app)
  .listen(port, function () {
    console.log(`App listening on port ${port}`);
  })