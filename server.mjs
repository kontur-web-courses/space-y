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

const authCookie = "auth";
app.use(express.static('spa/build'));
app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false,
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'spa/build/index.html'))
});
/*app.use(cookieParser);*/

/*app.get("/api/user", (req, res) => {
  let user = req.cookies[authCookie];
  res.json({user: user || null});
});

app.post("/api/user", (req, res) => {
  let { user } = req.body;
  res.cookie(authCookie, user, {httpOnly: true, secure: true, sameSite: "strict"});
  res.json({user: user || null});
});

app.delete("/api/user", (req, res) => {
  res.clearCookie(authCookie);
  res.sendStatus(200);
});
app.use(bodyParser.json());*/

https.createServer(
    {
        key: fs.readFileSync('certs/server.key'),
        cert: fs.readFileSync('certs/server.cert'),
    },
    app,
).listen(port, () => {
    console.log(`App listening on port ${port}`);
});