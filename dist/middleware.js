export const middlewareLogResponses = (req, res, next) => {
    res.on("finish", () => {
        if (res.statusCode != 200) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
        }
    });
    next();
};
export const middlewareHandleErrors = (err, req, res, next) => {
    console.log(err);
    res.status(500).json({
        error: "Something went wrong on our end"
    });
};
