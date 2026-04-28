import express from "express";
import { config, middlewareMetricsInc } from "./config.js";
const app = express();
app.use(express.json());
const PORT = 8080;
const middlewareLogResponses = (req, res, next) => {
    res.on("finish", () => {
        if (res.statusCode != 200) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
        }
    });
    next();
};
app.use(middlewareLogResponses);
const handlerReadiness = (req, res) => {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
};
const handlerMetricsDisplay = (req, res) => {
    res.set("Content-Type", "text/html; charset=utf-8");
    res.end(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
  </body>
</html>`);
};
const handlerMetricsReset = (req, res) => {
    config.fileserverHits = 0;
    res.send("OK");
};
const handlerValidateChirp = (req, res) => {
    res.header("Content-Type", "application/json");
    if (req.body.body.length <= 140) {
        res.status(200).send(JSON.stringify({ "valid": true }));
    }
    else {
        res.status(400).send(JSON.stringify({ "error": "Chirp is too long" }));
    }
};
app.get("/admin/metrics", handlerMetricsDisplay);
app.post("/admin/reset", handlerMetricsReset);
app.post("/api/validate_chirp", handlerValidateChirp);
app.get("/api/healthz", handlerReadiness);
app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
