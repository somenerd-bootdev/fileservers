import express, { NextFunction } from "express";
import { Request, Response } from "express";
import { config, middlewareMetricsInc } from "./config.js"
import { middlewareLogResponses, middlewareHandleErrors } from "./middleware.js";

const app = express();
app.use(express.json());

const PORT = 8080;
const bad_words = ["kerfuffle", "sharbert", "fornax"];

app.use(middlewareLogResponses);

const handlerReadiness = (req: Request, res: Response) => {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
};

const handlerMetricsDisplay = (req: Request, res: Response) => {
    res.set("Content-Type", "text/html; charset=utf-8");
    res.end(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
  </body>
</html>`);
};

const handlerMetricsReset = (req: Request, res: Response) => {
    config.fileserverHits = 0;
    res.send("OK");
};

const handlerValidateChirp = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.header("Content-Type", "application/json");
        let body = req.body.body;
        if (body.length <= 140) {
            let body_parts = body.split(" ");
            let index = 0;
            for (let body_part of body_parts) {
                if (bad_words.includes(body_part.toLowerCase())) {
                    body_parts[index] = "****";
                }
                index++;
            }
            body = body_parts.join(" ");
            res.status(200).send(JSON.stringify({ "cleanedBody": body }));
        }
        else {
            throw new Error("Chirp is too long");
        }
    } catch (err) {
        next(err);
    }
};

app.get("/admin/metrics", handlerMetricsDisplay)
app.post("/admin/reset", handlerMetricsReset);
app.post("/api/validate_chirp", handlerValidateChirp);

app.get("/api/healthz", handlerReadiness);

app.use("/app", middlewareMetricsInc);
app.use(middlewareHandleErrors);
app.use("/app", express.static("./src/app"));

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});