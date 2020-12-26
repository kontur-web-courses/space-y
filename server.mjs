import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import { type } from "os";

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
app.get('/api/info/', async (req, res) => {
  const responseApi = await fetch('https://api.spacexdata.com/v4/company');
  if (responseApi.ok) {
    const data = await responseApi.json();
    const dataJson = {
      founder: data.founder,
      founded: data.founded,
      employees: data.employees,
      ceo: data.ceo,
      coo: data.coo,
      cto: data.cto,
      valuation: data.valuation,
      headquarters: data.headquarters,
      summary: data.summary,
    };
    res.send(dataJson);
  } else {
    res.status(responseApi.status).end();
  }
});
app.get("/api/history", async (req, res) => {
  const responseApi = await fetch('https://api.spacexdata.com/v3/history');
  if(responseApi.ok){
    const data = await responseApi.json()
    const dataJson = data.map(x => 
      {
        return {
                id: x.id, 
                title:x.title}
      });
    res.send(dataJson);
    
  } else {
    res.status(responseApi.status).end;
  }
})
app.get('/api/history/event/', async (req, res) => {
  const responseApi = await fetch(`https://api.spacexdata.com/v3/history/${req.query.id}`);
  if (responseApi.ok) {
    const data = await responseApi.json();
    const dataJson = {
      details: data.details,
      event_date_utc: data.event_date_utc,
      id: data.id,
      links: data.links,
      title: data.title,
    }
    res.send(dataJson);
  } else {
    res.status(responseApi.status).end();
  }
});

app.get('/api/rockets/', async (req, res) => {
  const responseApi = await fetch(`https://api.spacexdata.com/v3/rockets`);
  if (responseApi.ok) {
    const data = await responseApi.json();  
    const dataJson = data.map(x => {
                                      return {
                                        rocket_id: x.id,
                                        rocket_name: x.rocket_name,
                                      };
                                    });
    res.json(dataJson);
  } else {
    res.status(responseApi.status).end();
  }
});

app.get('/api/rocket/', async (req, res) => {
  const responseApi = await fetch(`https://api.spacexdata.com/v3/rockets/${req.query.id}`);
  if (responseApi.ok) {
    const data = await responseApi.json();   
    const dataJson = JSON.stringify({
        rocket_id: data.id,
        rocket_name: data.rocket_name,
        first_flight: data.first_flight,
        description: data.description,
        wikipedia: data.wikipedia,
        flickr_images: data.flickr_images,
        height: data.height,
        diameter: data.diameter,
        mass: data.mass,
        engines: data.engines,
        first_stage: data.first_stage,
        second_stage: data.second_stage
      })
    
    res.send(dataJson);
  } else {
    res.status(responseApi.status).end();
  }
});

app.get('/api/roadster/', async (req, res) => {
  const responseApi = await fetch(`https://api.spacexdata.com/v3/roadster`);
  if (responseApi.ok) {
    const data = await responseApi.json();
    const dataJson = JSON.stringify({
      name: data.rocket_name,
      launch_date_utc: data.launch_date_utc,
      details: data.details,
      earth_distance_km: data.earth_distance_km,
      mars_distance_km: data.mars_distance_km,
      wikipedia: data.wikipedia
    })
    res.send(dataJson);
  } else {
    res.status(responseApi.status).end();
  }
});

app.get("/", (_, res) => {
  res.redirect("/index.html");
});

https.createServer({
  key: fs.readFileSync("certs/server.key"),
  cert: fs.readFileSync("certs/server.cert")
}, app)

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
