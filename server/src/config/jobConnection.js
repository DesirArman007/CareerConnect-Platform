import mongoose from "mongoose";

const jobConnection = mongoose.createConnection(
  process.env.JOBS_DB_URI,
  {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  }
);

jobConnection.on("connected", () => {
  console.log("Jobs DB Connected:", jobConnection.host);
});

jobConnection.on("error", (err) => {
  console.error("Jobs DB Error:", err);
});

jobConnection.on("disconnected", () => {
  console.log("Jobs DB Disconnected");
});

export { jobConnection };
