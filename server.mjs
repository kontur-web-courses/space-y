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

// вот тут не работает
const checkSession = (req, res, next) => {
    console.log("КУКИКУКИКУКИКУКИКУКИКУКИКУКИКУКИ", req.cookies, "КУКИКУКИКУКИКУКИКУКИКУКИКУКИКУКИКУКИ")
        // if (req.cookies === undefined && req.url == "/login" || !req.url.includes("api") || !req.url.includes("static")) {
        // next()
        // } else
        // res.redirect("/login")
    console.log(req.url)
    if (req.cookies === undefined && !req.url.includes('login')) {
        console.log('redirecting')
        res.redirect('https://metanit.com/')
    } else {
        next()
    }
}

app.get("/client.mjs", checkSession, (_, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.sendFile(path.join(rootDir, "client.mjs"), {
        maxAge: -1,
        cacheControl: false,
    });
});

app.use(cookieParser())
app.use(bodyParser.json())
app.use(express.static('spa/build'))

let userName = ""

app.get("/api/getUser", (req, res) => {
    res.send({ "userName": req.cookies.userName })
})

app.post("/api/loginUser", (req, res) => {
    userName = req.body["userName"];
    res.cookie("userName", userName, { httpOnly: true, secure: true, sameSite: true })
    res.send({ "userName": userName })
})

app.post("/api/logoutUser", (req, res) => {
    userName = '';
    res.cookie("userName", userName, { httpOnly: true, secure: true, sameSite: true })
    res.send({ "userName": userName })
})

app.get("*", checkSession, (_, res) => {
    res.sendFile(path.join(rootDir, "/spa/build/index.html"))
});

https.createServer({
        key: fs.readFileSync('certs/server.key'),
        cert: fs.readFileSync('certs/server.cert')
    },
    app).listen(port, () => {
    console.log(`App listening on port ${port}`);
});