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

app.use(express.static("spa/build"));
app.use(cookieParser());
app.use(bodyParser());

app.get("/api/login", (req, res) => {
    const userName = req.query.username;
    console.log(' 12'+ userName);
    res.cookie("username", userName,{httpOnly: true,secure: true,sameSite:'strict'});
    res.status(200).end();
});

app.get("/api/user", (req, res) => {
    const userName = req.cookies.username;
    console.log(userName);
    res.send(userName);
});

app.get("/api/logout", (req, res) => {
    res.clearCookie("username");
    res.send(200);
})

app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false,
  });
});

app.get('/api/info/', async (req, res) => {
    const resAPI = await fetch('https://api.spacexdata.com/v4/company');
    if (resAPI.ok) {
        const json = await resAPI.json();
        res.json({
            founder: json.founder,
            founded: json.founded,
            employees: json.employees,
            ceo: json.ceo,
            coo: json.coo,
            cto: json.cto,
            valuation: json.valuation,
            headquarters: json.headquarters,
            summary: json.summary,
        });
    } else {
        res.status(resAPI.status).end();
    }
});

app.get('/api/history/', async (req, res) => {
    const resAPI = await fetch('https://api.spacexdata.com/v4/history');
    if (resAPI.ok) {
        const json = await resAPI.json();
        res.json(json.map(e => {
            return {
                id: e.id,
                title: e.title,
            }
        }));
    } else {
        res.status(resAPI.status).end();
    }
});

app.get('/api/history/event/', async (req, res) => {
    const resAPI = await fetch(`https://api.spacexdata.com/v4/history/${req.query.id}`);
    if (resAPI.ok) {
        const json = await resAPI.json();
        res.json({
            details: json.details,
            event_date_utc: json.event_date_utc,
            id: json.id,
            links: json.links,
            title: json.title,
        });
    } else {
        res.status(resAPI.status).end();
    }
});

app.get('/api/rockets/', async (req, res) => {
    const resAPI = await fetch(`https://api.spacexdata.com/v4/rockets`);
    if (resAPI.ok) {
        const json = await resAPI.json();
        res.json(json.map(e => {
            return {
                rocket_id: e.id,
                rocket_name: e.name,
            };
        }));
    } else {
        res.status(resAPI.status).end();
    }
});

app.get('/api/rocket/', async (req, res) => {
    const resAPI = await fetch(`https://api.spacexdata.com/v4/rockets/${req.query.id}`);
    if (resAPI.ok) {
        const json = await resAPI.json();
        res.json({
            rocket_id: json.id,
            rocket_name: json.name,
            first_flight: json.first_flight,
            description: json.description,
            wikipedia: json.wikipedia,
            flickr_images: json.flickr_images,
            height: json.height,
            diameter: json.diameter,
            mass: json.mass,
            engines: json.engines,
            first_stage: json.first_stage,
            second_stage: json.second_stage,
        });
    } else {
        res.status(resAPI.status).end();
    }
});

app.get('/api/roadster/', async (req, res) => {
    const resAPI = await fetch(`https://api.spacexdata.com/v4/roadster`);
    if (resAPI.ok) {
        const json = await resAPI.json();
        res.json({
            name: json.name,
            launch_date_utc: json.launch_date_utc,
            details: json.details,
            earth_distance_km: json.earth_distance_km,
            mars_distance_km: json.mars_distance_km,
            wikipedia: json.wikipedia,
        });
    } else {
        res.status(resAPI.status).end();
    }
});

app.get("/*", (_, res) => {
  res.sendFile(path.join(rootDir, "spa", "build", "index.html"));
});

https.createServer({
  key: fs.readFileSync(path.join(rootDir, "/certs/server.key")),
  cert: fs.readFileSync(path.join(rootDir, "/certs/server.cert"))
}, app)
    .listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
