process.loadEnvFile();
const migrationConfig = {
    migrationsFolder: "./src/db/migrations",
};
const dbConfig = {
    migrationConfig: migrationConfig,
    url: process.env.DB_URL || ''
};
const apiConfig = {
    fileserverHits: 0,
    platform: process.env.PLATFORM || '',
    bearerSecret: process.env.BEARER_SECRET || '',
    polkaKey: process.env.POLKA_KEY || ''
};
export const config = {
    db: dbConfig,
    api: apiConfig
};
export function middlewareMetricsInc(req, res, next) {
    config.api.fileserverHits++;
    next();
}
