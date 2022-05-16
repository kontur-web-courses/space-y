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
let key  = fs.readFileSync(path.join(rootDir, "certs", "server.key"));
let cert = fs.readFileSync(path.join(rootDir, "certs", "server.cert"));
let credentials = {key: key, cert: cert};


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

let httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
