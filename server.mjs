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
app.use(express.json());

app.get("/client.mjs", (_, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.sendFile(path.join(rootDir, "client.mjs"), {
        maxAge: -1,
        cacheControl: false,
    });
});

let user = 'user';

app.get("/api/user", (req, res) => {
    const name = req.cookies[user];
    res.json(name || null);
});

app.post("/api/user", (req, res) => {
    const { name } = req.body;
    res.cookie(user, name, { httpOnly: true, secure: true, sameSite: "strict" });
    res.json(name || null);
});

app.delete("/api/user", (req, res) => {
    res.clearCookie(user);
    res.sendStatus(200);
});

app.use(express.static("spa/build"));

function validateCookies(req, res, next) {
    if (req.cookies[user]) {
        next()
    } else {
        res.redirect('/login');
    }
}

app.use('*', validateCookies, express.static('spa/build/index.html'));

https.createServer({
        key: fs.readFileSync('certs/server.key'),
        cert: fs.readFileSync('certs/server.cert')
    }, app)
    .listen(3000, function() {
        console.log('Example app listening on port 3000! Go to https://localhost:3000/')
    });