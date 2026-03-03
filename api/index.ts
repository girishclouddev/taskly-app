import express from "express";
import path from "path";
import { registerRoutes } from "../server/routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

await registerRoutes(app);

// Serve frontend
const distPath = path.join(process.cwd(), "dist");

app.use(express.static(distPath));

app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

export default app;