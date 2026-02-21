import mongoose from "mongoose";
import { DB_NAME } from "../constansts.js"

const connectDB = async () => {
    try {
        await mongoose.connect(
            `${process.env.MONGODB_URL}/${DB_NAME}`,
            {
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                maxPoolSize: 10,
            }
        );

        console.log("Main MongoDB Connected:", mongoose.connection.host);
    } catch (error) {
        console.error("Main DB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;
