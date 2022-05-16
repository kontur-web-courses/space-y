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
app.use(bodyParser.json());
app.use(express.static('spa/build'));

app.get("/client.mjs", (_, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.sendFile(path.join(rootDir, "client.mjs"), {
        maxAge: -1,
        cacheControl: false,
    });
});

function validate (request, response, next) {
    const user = request.cookies["logged"];

    if (!user && (request.path.startsWith("/static") || request.path.startsWith("/api") || request.path !== "/login")) {
        response.redirect("/login");
    }
    next();
}

app.use(validate);

app.get("/api/user", (req, res) => {
    const user = req.cookies["logged"];
    res.json({user: user || null});
});

app.post("/api/user", (req, res) => {
    const { user } = req.body;
    res.cookie("logged", user, {httpOnly: true, secure: true, sameSite: "strict"});
    res.json({user: user || null});
});

app.delete("/api/user", (req, res) => {
    res.clearCookie("logged");
    res.sendStatus(200);
});


app.get("/*", (_, res) => {
    res.sendFile(path.join(rootDir, "spa/build/index.html"));
});


https.createServer({
    key: fs.readFileSync(path.join(rootDir, "/certs/server.key")),
    cert: fs.readFileSync(path.join(rootDir, "/certs/server.cert"))
}, app)
    .listen(port, () => {
        console.log(`App listening on port ${port}`);
    });