import dotenv from "dotenv"
import connectDB from "./config/db.js"
import { app } from "./app.js"
import client from "./cache/client.js"

dotenv.config()

connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        const isProduction = process.env.NODE_ENV === "production";
        console.log("Server started");
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`Port: ${process.env.PORT || 8000}`);
        console.log(`HTTPS assumed: ${isProduction}`);
        console.log(`Cookie config: secure=${isProduction}, sameSite=${isProduction ? 'none' : 'lax'}, partitioned=${isProduction}`);
    })
})
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })