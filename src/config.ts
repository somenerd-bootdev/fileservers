import { Request, Response, NextFunction } from "express";
import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile();

type APIConfig = {
    fileserverHits: number;
};

type DBConfig = {
    url: string;
    migrationConfig: MigrationConfig;
}

const migrationConfig: MigrationConfig = {
    migrationsFolder: "./src/db/migrations",
};

const dbConfig: DBConfig = {
    migrationConfig: migrationConfig,
    url: process.env.DB_URL || ''
}

const apiConfig: APIConfig = {
    fileserverHits: 0
}

export const config = {
    db: dbConfig,
    api: apiConfig
}


export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.api.fileserverHits++;
    next();
}