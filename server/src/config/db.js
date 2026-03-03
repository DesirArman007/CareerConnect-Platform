import mongoose from "mongoose";
import { logger } from "./logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URL,
      {
        serverSelectionTimeoutMS: 60000,
        connectTimeoutMS: 60000,
        socketTimeoutMS: 60000,
        maxPoolSize: 10,
        minPoolSize: 2,
        retryWrites: true,
        retryReads: true,
      }
    );

    logger.info({ host: mongoose.connection.host }, "MongoDB connected");

  } catch (error) {
    logger.error({ err: error }, "MongoDB connection error");
    process.exit(1);
  }
};

export default connectDB;