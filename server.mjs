import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

const rootDir = process.cwd();
const port = 3000;
const app = express();
const auth = "auth";

app.use(cookieParser());
app.use(express.json());

const checkSession = (req, res, next) => {
  const user = req.cookies[auth];
  if(user || req.path == "/login") {
    next();
  } else {
    res.redirect("/login");
  }
};

app.use(express.static('spa/build'));



app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false,
  });
});



app.get("/api/user", (req, res) => {
  let user = req.cookies[auth];
  res.json({user: user || null});
});

app.post("/api/user", (req, res) => {
  let { user } = req.body;
  res.cookie(auth, user, {httpOnly: true, secure: true, sameSite: "strict"});
  res.json({user: user || null});
});

app.delete("/api/user", (req, res) => {
  res.clearCookie(auth);
  res.sendStatus(200);
});

/*
app.post("/api/*", (req, res) => {
  if (!req.cookies[auth]) {
    return res.sendStatus(403);
  }
  const originalPath = req.path.replace("/api", "");
  const proxy = await fetch(`https://api.spacexdata.com/v3${originalPath}`);
  if(proxy.ok) {
    proxy.body.pipe(res);
  } else {
    res.sendStatus(503);
  }
});*/



app.get('*', checkSession, function(req, res){
  res.sendFile(path.join(rootDir, 'spa/build/index.html'));
});

https.createServer({
  key: fs.readFileSync('certs/server.key'),
  cert: fs.readFileSync('certs/server.cert')
}, app).listen(port, () => {
  console.log(`App listening on port ${port}`);
});

