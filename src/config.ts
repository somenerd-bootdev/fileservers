import { Request, Response, NextFunction } from "express";

type APIConfig = {
    fileserverHits: number;
};

export const config: APIConfig = {
    fileserverHits: 0
}

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits++;
    next();
}