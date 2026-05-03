import { Request, Response, NextFunction } from "express";
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } from "./customerrors.js"

export const middlewareLogResponses = (req: Request, res: Response, next: NextFunction) => {
    res.on("finish", () => {
        if (res.statusCode != 200) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`)
        }
    });
    next();
};

export const middlewareHandleErrors = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    if (err instanceof BadRequestError) {
        res.status(400).json({
            error: err.message
        });
    } else if (err instanceof UnauthorizedError) {
        res.status(401).json({
            error: err.message
        });
    }
    else {
        res.status(500).json({
            error: "Something went wrong on our end"
        });
    }
};