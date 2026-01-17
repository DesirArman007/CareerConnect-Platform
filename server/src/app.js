import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user.routes.js";
import uploadRouter from "./routes/upload.routes.js"

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Dev logger
app.use((req, res, next) => {
  console.log("--- New Request Received ---");
  console.log("URL:", req.originalUrl);
  console.log("METHOD:", req.method);
  console.log("HEADERS:", req.headers);
  console.log("BODY:", req.body);
  console.log("--------------------------");
  next();
});

// Mount routers

app.get("/",(req,res)=>{
  res.send("Hello")
})

app.use("/api/users", userRouter);
app.use("/api/uploads", uploadRouter);

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

  
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
}); 

export { app };