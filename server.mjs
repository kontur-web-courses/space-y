import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fetch from "node-fetch";


const rootDir = process.cwd();
const port = 3000;
const cookieName = "authenticationName";
const loginPath = "/login"
const externalApiUrl = "https://api.spacexdata.com/v3";
const app = express();

app.use(cookieParser());
app.use(express.json());

const checkAuth = (req, res, next) => {
	const user = req.cookies[cookieName];
	if(user || req.path === loginPath) {
		next();
	} else {
		res.redirect(loginPath);
	}
};

app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false,
  });
});

app.get("/api/user", (req, res) => {
	const user = req.cookies[cookieName];
	res.json({ user: user ?? null})
});
app.post("/api/user", (req, res) => {
	const {user} = req.body;
	res.cookie(cookieName, user, {httpOnly: true, secure: true, sameSite: "strict"});
	res.json({ user: user ?? null});
});
app.delete("/api/user", (req, res) => {
  res.clearCookie(cookieName);
  res.sendStatus(200);
});


app.get('/api/*', async (req, res) => {
	if(!req.cookies[cookieName]) {
		return res.sendStatus(403);
	}
	const originalPath = req.path.replace("/api", "");
	const proxy = await fetch(`${externalApiUrl}${originalPath}`);
	if(proxy.ok) {
		proxy.body.pipe(res);
	} else {
		res.sendStatus(503);
	}
});


app.use(express.static(path.join(rootDir, 'spa/build')));

app.get('*', checkAuth, (_, res) => {
	res.sendFile(path.join(rootDir, 'spa/build/index.html'))
});

https.createServer({
	key: fs.readFileSync('certs/server.key'),
	cert: fs.readFileSync('certs/server.cert')
}, app)
.listen(port, function() {
	console.log('Example app listening on port 3000! Go to https://localhost:3000/')
});
