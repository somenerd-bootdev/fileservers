import express from "express";
const app = express();
const PORT = 8080;
app.use("/app", express.static("./src/app"));
const handlerReadiness = (req, res) => {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK"); //req.body)
};
app.get("/healthz", handlerReadiness);
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
