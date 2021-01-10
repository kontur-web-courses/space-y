import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
/*import fetch from "node-fetch";*/

const rootDir = process.cwd();
const port = 3000;
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(rootDir, "spa/build")));

const check = (req, res, next) => {
  const login = req.cookies["login"];
  if (login || req.path === "/login") {
    next()
  } else{
    res.redirect("/login");
  }
}

app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false,
  });
});

app.get("/api/user", (req, res) => {
  let user = req.cookies["login"];
  res.json({user: user !== null});
});

app.post("/api/user", (req, res) => {
  let { user } = req.body;
  res.cookie("login", user, {httpOnly: true, secure: true, sameSite: "strict"});
  res.json({user: user !== null});
});

app.delete("/api/user", (req, res) => {
  res.clearCookie("login");
  res.sendStatus(200);
});

app.get("/api/*", async (req, res) => {
  if (!req.cookies["login"]){
    return res.sendStatus(403);
  }
  let path = req.path.replace("/api", "");
  let proxy = await fetch(`https://api.spacexdata.com/v3${path}`);
  if (proxy.ok) {
    proxy.body.pipe(res);
  } else {
    res.sendStatus(503);
  }
});

app.get("*", check, function (_, res) {
  res.sendFile(path.join(rootDir, "spa/build/index.html"));
});

https.createServer({
  key: fs.readFileSync("certs/server.key"),
  cert: fs.readFileSync("certs/server.cert"),
}, app)
    .listen(port, () => {
      console.log(`App listening on port ${port}`);
    });