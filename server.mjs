import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import fetch from "node-fetch";
const rootDir = process.cwd();
const port = 3000;
const app = express();

app.use(cookieParser());
app.use(express.static('spa/build'));
app.use(express.json());

const USERNAME_COOKIE = 'username';

const redirectWithoutLogin = (req, res, next) => {
    // Сделай так, чтобы при заходе на любой роут приложения, кроме api, статики и /login без cookie происходил редирект на страницу /login.
    if (req.originalUrl.includes('api') || req.originalUrl.includes('static') || req.originalUrl.includes('login') || req.originalUrl.includes('client')) {
        next();
        return;
    }

    if (!req.cookies[USERNAME_COOKIE]) {
        res.redirect('/login/');
        next();
        return;
    }

    next();
}

app.use(redirectWithoutLogin);


app.get("/client.mjs", (_, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.sendFile(path.join(rootDir, "client.mjs"), {
        maxAge: -1,
        cacheControl: false,
    });
});
app.post('/api/login/', (req, res) =>{
    const username = req.body.username;
    res.cookie(USERNAME_COOKIE, username, {secure:true, httpOnly: true, sameSite: "strict"});
    res.json({
        username: username
    });
});
app.get('/api/get-user/', (req, res) => {
    res.json({
        'username': req.cookies[USERNAME_COOKIE]
    });
});
app.post('/api/logout/', (req, res) => {
    res.clearCookie(USERNAME_COOKIE);
    res.json({
        'success': 'ok'
    });
});
app.get('/api/about', async (req, res) => {
    const result = await fetch('https://api.spacexdata.com/v3/info');
    const data = await result.json();
    res.json(data);
});
app.get('/api/history', async (req, res)=>{
    const result = await fetch('https://api.spacexdata.com/v3/history');
    const data = await result.json();
    res.json(data);
});
app.get('/api/rockets', async (req, res)=>{
    const result = await fetch('https://api.spacexdata.com/v3/rockets');
    const data = await result.json();
    res.json(data);
});
app.get('/api/rockets-element/', async (req, res)=>{
    const eventId = req.query.id;
    const result = await fetch(`https://api.spacexdata.com/v3/rockets?id=${eventId}`);
    const data = await result.json();
    res.json(data);
});
app.get('/api/roadster', async (req, res)=>{
    const result = await fetch('https://api.spacexdata.com/v3/roadster');
    const data = await result.json();
    res.json(data);
});
app.get('/api/history-element/', async (req, res)=>{
    const eventId = req.query.id;
    const result = await fetch(`https://api.spacexdata.com/v3/history?id=${eventId}`);
    const data = await result.json();
    res.json(data);
});
app.get('/api/sentToMars',async (req, res)=>{
    const eventId = req.query.id;
    const result = await fetch(`https://api.spacexdata.com/v3/history?id=${eventId}`);
    const data = await result.json();
    res.json(data);
});
app.get('*', function(req, res) {
    res.sendFile('spa/build/index.html', { root: '.'});
});
https.createServer(
    {
        key: fs.readFileSync('certs/server.key'),
        cert: fs.readFileSync('certs/server.cert'),
    },
    app,
).listen(port, () => {
    console.log(`App listening on port ${port}`);
});