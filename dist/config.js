export const config = {
    fileserverHits: 0
};
export function middlewareMetricsInc(req, res, next) {
    config.fileserverHits++;
    next();
}
