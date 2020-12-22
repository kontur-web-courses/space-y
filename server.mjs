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

app.use(cookieParser());
app.use(bodyParser());
app.use(express.static("spa/build"));

app.get("/client.mjs", (_, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.sendFile(path.join(rootDir, "client.mjs"), {
        maxAge: -1,
        cacheControl: false,
    });
});

app.get("/api/login", (req, res,) => {
    const userName = req.query.username;
    res.cookie("username", userName,{httpOnly: true,secure: true,sameSite:'strict'});
    res.status(200).end();

});

app.get("/api/user", (req, res) => {
    const userName = req.cookies.username;
    res.send(userName);
});

app.get("/api/logout", (req, res) => {
    res.clearCookie("username");
    res.send(200);
});

app.get("/*", (_, res) => {
    res.redirect("/index.html")
});

https.createServer({
    key: fs.readFileSync("certs/server.key"),
    cert: fs.readFileSync("certs/server.cert")
}, app)
    .listen(port, () => {
        console.log(`App listening on port ${port}`);
    });
