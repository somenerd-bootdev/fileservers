import express from "express";
import { Request, Response, NextFunction } from "express";
import { config, middlewareMetricsInc } from "./config.js"

const app = express();
const PORT = 8080;

const middlewareLogResponses = (req: Request, res: Response, next: NextFunction) => {
    res.on("finish", () => {
        if (res.statusCode != 200) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`)
        }
    });
    next();
}

app.use(middlewareLogResponses);

const handlerReadiness = (req: Request, res: Response) => {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
};

const handlerMetricsDisplay = (req: Request, res: Response) => {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(`Hits: ${config.fileserverHits}`);
};

const handlerMetricsReset = (req: Request, res: Response) => {
    config.fileserverHits = 0;
    res.send("OK");
};

app.get("/metrics", handlerMetricsDisplay)
app.get("/reset", handlerMetricsReset);
app.get("/healthz", handlerReadiness);

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});