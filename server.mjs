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

const loggedUsers = new Map();
const allowedPages = ["/api"];

const loginChecker = function(req, res, next) {
  if (!req.cookies["username"]
    && (req.path.startsWith("/api") || req.path.startsWith("/static") || req.path.startsWith("/login"))) {
    req.redirect("/login");
  }
  next();
};

app.use("/static", express.static(path.join(rootDir, "spa", "build", "static")));
app.use(express.json());
app.use(cookieParser());
app.use(loginChecker);

app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false
  });
});

app.get("/", (_, res) => {
  res.send(":)");
});

app.get("/api/getUser", (req, res) => {
  const un = loggedUsers.get(req.sessionId) || "null";
  res.cookie("username", un, { httpOnly: true, secure: true, sameSite: "strict" });
  res.json({ username: un });
});

app.post("/api/loginUser", (req, res) => {
  const user = req.body;
  loggedUsers.set(req.sessionId, user.username);
  res.cookie("username", user.username, { httpOnly: true, secure: true, sameSite: "strict" });
  res.json(user);
});

app.get("/api/logoutUser", (req, res) => {
  loggedUsers.delete(req.sessionId);
  res.clearCookie("username");
  res.send("1");
});

app.get("/*", (_, res) => {
  res.sendFile(path.join(rootDir, "spa", "public", "index.html"));
});

https.createServer(
  {
    key: fs.readFileSync(path.join(rootDir, "certs", "server.key")),
    cert: fs.readFileSync(path.join(rootDir, "certs", "server.cert"))
  },
  app
)
  .listen(port, () => {
    console.log(`https://localhost:${port}`);
  });
