import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import dataRoutes from "./routes/data.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();
const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://localhost:5173,http://127.0.0.1:5173,https://frontend-blue-alpha-88.vercel.app/"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get("/", (req, res) =>
  res.json({
    ok: true,
    service: "MOIL AI Backend",
    message: "Backend is running successfully.",
  }),
);
app.get("/api/health", (req, res) =>
  res.json({ ok: true, service: "MOIL AI Backend", time: new Date() }),
);
app.use("/api/data", dataRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
const port = process.env.PORT || 3000;
const host = process.env.HOST || "0.0.0.0";
connectDB()
  .then(() =>
    app.listen(port, host, () =>
      console.log(`Server running on ${host}:${port}`),
    ),
  )
  .catch(() => {
    console.error(
      "Backend startup stopped because the database connection failed.",
    );
    process.exit(1);
  });
