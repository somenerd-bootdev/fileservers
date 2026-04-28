import express from "express";
import { config, middlewareMetricsInc } from "./config.js";
import { middlewareLogResponses, middlewareHandleErrors } from "./middleware.js";
import { BadRequestError } from "./customerrors.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { createUser, deleteAllUsers } from "./db/queries/users.js";
import { createChirp } from "./db/queries/chirps.js";
import { DrizzleQueryError } from "drizzle-orm";
process.loadEnvFile();
envOrThrow();
const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);
const app = express();
app.use(express.json());
const PORT = 8080;
const bad_words = ["kerfuffle", "sharbert", "fornax"];
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
    <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
  </body>
</html>`);
};
const handlerMetricsReset = async (req, res) => {
    config.api.fileserverHits = 0;
    console.log("PLATFORM:", JSON.stringify(process.env.platform));
    if (config.api.platform !== "dev") {
        res.status(403).send("Forbidden");
    }
    await deleteAllUsers();
    res.status(200).send("OK");
};
const handlerChirps = async (req, res, next) => {
    try {
        res.header("Content-Type", "application/json");
        let body = req.body.body;
        let userId = req.body.userId;
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
            const newChirp = await createChirp({
                body: body,
                userId: userId,
            });
            res.status(201).json(newChirp);
        }
        else {
            throw new BadRequestError("Chirp is too long. Max length is 140");
        }
    }
    catch (err) {
        next(err);
    }
};
const handlerCreateUserForEmail = async (req, res, next) => {
    try {
        const newUser = await createUser({
            email: req.body.email
        });
        res.status(201).json(newUser);
    }
    catch (err) {
        if (err instanceof DrizzleQueryError) {
            const cause = err.cause;
            if (cause?.code === "23505") {
                res.status(409).send(`User already exists for email: ${req.body.email}`);
                return;
            }
        }
        next(err);
    }
};
app.get("/admin/metrics", handlerMetricsDisplay);
app.post("/admin/reset", handlerMetricsReset);
app.post("/api/users", handlerCreateUserForEmail);
app.post("/api/chirps", handlerChirps);
app.get("/api/healthz", handlerReadiness);
app.use("/app", middlewareMetricsInc);
app.use(middlewareHandleErrors);
app.use("/app", express.static("./src/app"));
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
function envOrThrow() {
    if (process.env.DB_URL == undefined) {
        throw new Error("Database URL is missing");
    }
}
