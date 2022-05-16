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
let redirectMiddleware = function (req, res,next) {
  let path = req.path;
  if (req.cookies.username || path === '/login' || path.startsWith("/static") || path.startsWith("/api") || path === '/client.mjs') {
    next()
  } else {
    res.redirect("login");
  }
}

app.use(cookieParser());
app.use(redirectMiddleware)
app.get("/client.mjs", (_, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.sendFile(path.join(rootDir, "client.mjs"), {
        maxAge: -1,
        cacheControl: false,
    });
});

app.get("/", (_, res) => {
    res.send(":)");
});
app.get("/login", (_, res) => {
  res.sendFile(path.join(rootDir, "spa/build/index.html"));
});
app.get("/api/user", (req, res) => {
    const userName = req.cookies.username;
    res.send(userName);
});

app.get("/api/login", (req, res) => {
  const userName = req.query.username;
  res.cookie("username", userName, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  res.send(userName);
});

app.get("/api/logout", (req, res) => {
  res.clearCookie("username");
  res.sendStatus(200);
});

app.use(express.static('./spa/build'))

app.get("/api/info", async (req, res) => {
  let info = await fetch("https://api.spacexdata.com/v3/info");
  if (info.ok) {
    let json = await info.json();
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
    res.status(info.status).end();
  }
});

app.get("/api/history", async (req, res) => {
  let history = await fetch("https://api.spacexdata.com/v3/history");
  if (history.ok) {
    let json = await history.json();
    res.json(
        json.map((event) => {
          return {
            id: event.id,
            title: event.title,
          };
        })
    );
  } else {
    res.status(history.status).end();
  }
});

app.get("/api/history/event/", async (req, res) => {
    let historyEvent = await fetch(
        `https://api.spacexdata.com/v3/history/${req.query.id}`
    );
    if (historyEvent.ok) {
        let json = await historyEvent.json();
        res.json({
            details: json.details,
            event_date_utc: json.event_date_utc,
            id: json.id,
            links: json.links,
            title: json.title,
        });
    } else {
        res.status(historyEvent.ok).end();
    }
});

app.get('*', function (req, res) {
    res.sendFile(path.join(rootDir, 'spa/build/index.html'));
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
