import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import apiRoutes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import { sendResponse } from "./utils/response";
import { env } from "./config/env";

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: [env.CLIENT_URL, "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use("/api/v1", apiRoutes);

app.use((_req, res) => {
  sendResponse(res, 404, "Requested API route does not exist.");
});

app.use(errorHandler);

export default app;
