process.loadEnvFile();
export const config = {
    fileserverHits: 0,
    dbURL: process.env.DB_URL || ''
};
export function middlewareMetricsInc(req, res, next) {
    config.fileserverHits++;
    next();
}
