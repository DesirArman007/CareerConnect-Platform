import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { app } from "./app.js";
import { logger } from "./config/logger.js";

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    app.listen(process.env.PORT || 8000, () => {
      const isProduction = process.env.NODE_ENV === "production";
      logger.info({
        env: process.env.NODE_ENV,
        port: process.env.PORT || 8000,
        httpsAssumed: isProduction,
        cookieConfig: {
          secure: isProduction,
          sameSite: isProduction ? "none" : "lax",
          partitioned: isProduction,
        },
      }, "Server started");
    });

  } catch (err) {
    logger.error({ err }, "Server startup failed");
    process.exit(1);
  }
};

startServer();