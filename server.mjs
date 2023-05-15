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
const loggedUsers = {};


app.use(express.static('spa/build'));

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

app.get("*", (_, res) => {
    res.sendFile(path.join(rootDir, "spa/build/index.html"));
})

https
    .createServer(
        {
            key: fs.readFileSync("certs/server.key"),
            cert: fs.readFileSync("certs/server.cert"),
        },
        app
    )

app.post("/api/login", (req, res) => {
    let username = req.body.username;
    loggedUsers[username] = true;
    res.cookie('username', username, {secure: true, httpOnly: true, sameSite: true});
    res.json({username: username});
});


app.post("/api/unlogin", (req, res) => {
    let username = req.body.username;
    delete loggedUsers[username];
    res.json({status: true});
});

let isAuthorized = function (req, res, next) {
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