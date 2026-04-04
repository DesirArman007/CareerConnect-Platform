import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import userRouter from "./routes/user.routes.js";
import uploadRouter from "./routes/upload.routes.js";
import jobRouter from "./routes/job.routes.js";
import feedbackRouter from "./routes/feedback.routes.js";
import userActionsRouter from "./routes/user.actions.routes.js";
import { logger, pinoHttp } from "./config/logger.js";

const app = express();

app.set('trust proxy', 1);

// 2. Global Request Logger (First Middleware)
app.use(pinoHttp);

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://luminajobs.vercel.app",
    "https://www.workraze.com",
    "https://workraze.com"
  ],
  credentials: true
}));

app.use((req, res, next) => {
  res.setHeader(
    'Cross-Origin-Opener-Policy',
    'same-origin-allow-popups'
  );
  next();
});

app.use(helmet());


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Mount routers

app.get("/", (req, res) => {
  res.send("Hello")
})

app.use("/api/users", userRouter);
app.use("/api/auth", userRouter);
app.use("/api/uploads", uploadRouter);
app.use("/api/job", jobRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/user-actions", userActionsRouter);

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// 7. Global Error Handler Logging
app.use((err, req, res, next) => {
  logger.error({ err, route: `${req.method} ${req.originalUrl}` }, "Error caught");

  // Pass to existing error handler logic or send response
  // Assuming ApiError structure or generic error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    errors: err.errors || []
  });
});

export { app };