import mongoose from "mongoose";

const URI = process.env.JOBS_DB_URI;

const jobConnection = mongoose.createConnection(URI, {
    dbName: 'job_aggregator'
});

jobConnection.on("connected", async () => {
           console.log("MongoDB Connected at host : ", jobConnection.host);
           console.log("DB Server connected ");
           
});

jobConnection.on("error", (err) => {
    console.log("Job Database Connection Error:", err);
});

export { jobConnection };