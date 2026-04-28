import { Request, Response, NextFunction } from "express";

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
    res.status(500).json({
        error: "Something went wrong on our end"
    });
};