import mongoose from "mongoose";

const jobConnection = mongoose.createConnection(process.env.JOBS_DB_URI, {
  serverSelectionTimeoutMS: 60000,
});

jobConnection.on("connected", () => {
  console.log("MongoDB Connected:", jobConnection.host);
});

jobConnection.on("error", (err) => {
  console.error("Job Database Connection Error:", err);
});

export { jobConnection };
