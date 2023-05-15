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
const loginUsers = {};

app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false
  });
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.sendFile(path.join(rootDir, "client.mjs"), {
        maxAge: -1,
        cacheControl: false,
    });
});

app.get("/", (_, res) => {
    res.send(":)");
});

app.use(express.static("spa/build"));
app.use(cookieParser());
app.use(express.json());

const isAuthorized = function (req, res, next) {
    if (req.originalUrl.includes('api') ||
        req.originalUrl.includes('static') ||
        req.originalUrl.includes('login')) {
        next();
        return;
    }
    if ("username" in req.cookies) {
        next();
        return;
    }
    res.redirect("/login");
    next();
}

app.use(isAuthorized);
app.use(isAuthorized);

app.get("/*", (req, res) => {
  res.sendFile(path.resolve("spa/build/index.html"));
});


app.post("/api/login", (req, res) => {
    let username = req.body.username;
    loginUsers[username] = true;
    res.cookie('username', username, {secure: true, httpOnly: true, sameSite: true});
    res.json({username: username});
});


app.post("/api/unlogin", (req, res) => {
    let username = req.body.username;
    delete loginUsers[username];
    res.json({status: true});
});