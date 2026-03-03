import express from "express";
import path from "path";
import { registerRoutes } from "../server/routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// wrap async setup properly
async function init() {
  await registerRoutes(app);

  const distPath = path.join(process.cwd(), "dist");

  app.use(express.static(distPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

init();

export default app;