import express from "express";
import { config, middlewareMetricsInc } from "./config.js";
import { middlewareLogResponses, middlewareHandleErrors } from "./middleware.js";
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } from "./customerrors.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { createUser, deleteAllUsers, getUserByEmail, getUserById, updateUser, upgradeUserToRed } from "./db/queries/users.js";
import { createChirp, getAllChirpsOrderedbyCreatedAt, getChirpById, deleteChirpById, getAuthorForChirpById } from "./db/queries/chirps.js";
import { createRefreshToken, getUserFromRefreshToken, revokeRefreshToken } from "./db/queries/refreshtokens.js";
import { DrizzleQueryError } from "drizzle-orm";
import { hashPassword, checkPasswordHash, getBearerToken, validateJWT, makeJWT, makeRefreshToken, getAPIKey } from "./auth.js";
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
    console.log("PLATFORM:", JSON.stringify(process.env.PLATFORM));
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
        const token = getBearerToken(req);
        let userId;
        try {
            userId = validateJWT(token, config.api.bearerSecret);
        }
        catch (errJWT) {
            throw new UnauthorizedError("Expired or invalid token");
        }
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
const handlerChirpsAll = async (req, res, next) => {
    try {
        const bearerToken = getBearerToken(req);
        validateJWT(bearerToken, config.api.bearerSecret);
        const chirps = await getAllChirpsOrderedbyCreatedAt();
        res.status(200).json(chirps);
    }
    catch (err) {
        next(err);
    }
};
const handlerChirpsOne = async (req, res, next) => {
    try {
        const chirpId = req.params['chirpId'];
        const chirp = await getChirpById(chirpId);
        if (chirp == null) {
            throw new NotFoundError("Requested chirp does not exist");
        }
        res.status(200).json(chirp);
    }
    catch (err) {
        next(err);
    }
};
const handlerDeleteChirp = async (req, res, next) => {
    try {
        const bearerToken = getBearerToken(req);
        let userId;
        try {
            userId = validateJWT(bearerToken, config.api.bearerSecret);
        }
        catch (errJWT) {
            throw new UnauthorizedError("Expired or invalid token");
        }
        const chirpId = req.params['chirpId'];
        let chirp;
        try {
            chirp = await getChirpById(chirpId);
            console.log(chirp);
        }
        catch (errCheckExists) {
            throw new NotFoundError("");
        }
        let authorId;
        authorId = await getAuthorForChirpById(chirpId);
        if (authorId.userId != userId) {
            throw new ForbiddenError("");
        }
        try {
            await deleteChirpById(chirpId);
        }
        catch (errDel) {
            throw new NotFoundError("");
        }
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
const handlerCreateUserForEmail = async (req, res, next) => {
    try {
        const password = req.body.password;
        const hashedPassword = await hashPassword(password);
        const newUser = await createUser({
            hashedPassword: hashedPassword,
            email: req.body.email
        });
        res.status(201).json({
            email: newUser.email,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
            id: newUser.id,
            isChirpyRed: newUser.isChirpyRed
        });
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
const handlerUpdateUser = async (req, res, next) => {
    try {
        const bearerToken = getBearerToken(req);
        let userId;
        try {
            userId = validateJWT(bearerToken, config.api.bearerSecret);
        }
        catch (errJWT) {
            throw new UnauthorizedError("Expired or invalid token");
        }
        const password = req.body.password;
        const email = req.body.email;
        const hashedPassword = await hashPassword(password);
        const updatedUser = await updateUser({
            hashedPassword: hashedPassword,
            email: email,
            id: userId
        });
        res.status(200).json({
            email: updatedUser.email,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
            id: updatedUser.id,
            isChirpyRed: updatedUser.isChirpyRed
        });
    }
    catch (err) {
        next(err);
    }
};
const handlerLogin = async (req, res, _next) => {
    try {
        const password = req.body.password;
        const user = await getUserByEmail(req.body.email);
        const match = await checkPasswordHash(password, user.hashedPassword);
        if (!match) {
            throw new UnauthorizedError("");
        }
        const refreshTokenValue = makeRefreshToken();
        const refreshTokenExpiry = new Date(Date.now() + (60 * 24 * 60 * 60 * 1000));
        await createRefreshToken({
            token: refreshTokenValue,
            userId: user.id,
            expiresAt: refreshTokenExpiry
        });
        res.status(200).json({
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            token: makeJWT(user.id, 3600, config.api.bearerSecret),
            refreshToken: refreshTokenValue,
            isChirpyRed: user.isChirpyRed
        });
    }
    catch (err) {
        console.log(err);
        res.status(401).send("incorrect email or password");
    }
};
const handlerRefresh = async (req, res, _next) => {
    try {
        const bearerToken = getBearerToken(req);
        const tokenUser = await getUserFromRefreshToken(bearerToken);
        const newJWTToken = makeJWT(tokenUser.userId, 3600, config.api.bearerSecret);
        res.status(200).json({
            token: newJWTToken
        });
    }
    catch (err) {
        console.log(err);
        res.status(401).send("Token invalid or does not exist");
    }
};
const handlerRevoke = async (req, res, _next) => {
    try {
        const bearerToken = getBearerToken(req);
        const revokeResult = await revokeRefreshToken(bearerToken);
        if (revokeResult == null) {
            throw new NotFoundError("Token invalid or does not exist");
        }
        res.status(204).send();
    }
    catch (err) {
        console.log(err);
        res.status(401).send("Token invalid or does not exist");
    }
};
const handlerWebhook = async (req, res, next) => {
    try {
        const apiKey = getAPIKey(req);
        if (apiKey != config.api.polkaKey) {
            throw new BadRequestError("");
        }
        const eventType = req.body.event;
        if (eventType != "user.upgraded") {
            res.status(204).send();
            return;
        }
        const userId = req.body.data.userId;
        try {
            let user = await getUserById(userId);
            console.log(user);
        }
        catch (errCheckExists) {
            throw new NotFoundError("");
        }
        try {
            const upgradedUser = await upgradeUserToRed(userId);
        }
        catch (upgErr) {
            res.status(404).send();
            return;
        }
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
app.get("/admin/metrics", handlerMetricsDisplay);
app.post("/admin/reset", handlerMetricsReset);
app.post("/api/users", handlerCreateUserForEmail);
app.put("/api/users", handlerUpdateUser);
app.get("/api/chirps", handlerChirpsAll);
app.get("/api/chirps/:chirpId", handlerChirpsOne);
app.delete("/api/chirps/:chirpId", handlerDeleteChirp);
app.post("/api/chirps", handlerChirps);
app.post("/api/login", handlerLogin);
app.post("/api/revoke", handlerRevoke);
app.post("/api/refresh", handlerRefresh);
app.get("/api/healthz", handlerReadiness);
app.post("/api/polka/webhooks", handlerWebhook);
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
