

import "dotenv/config";
import { jobConnection } from "./src/config/jobConnection.js";
import Job from "./src/models/jobModel.js";


const migrateData = async () => {
  try {
    console.log("⏳ Connecting to database...");

    // Wait for the connection to be ready if it isn't already
    if (jobConnection.readyState !== 1) {
      await new Promise((resolve, reject) => {
        jobConnection.once("open", resolve);
        jobConnection.once("error", reject);
      });
    }

    console.log("✅ Connected! Starting migration...");

    // 1. Update existing documents that are missing the 'joblive' field
    const result = await Job.updateMany(
      { joblive: { $exists: false } }, // Filter: Only target old docs
      { 
        $set: { 
          joblive: true,          // Default old jobs to Active
          experience: null        // Default experience to null (or "Not Specified")
        } 
      }
    );

    console.log(`🎉 Migration Complete!`);
    console.log(`- Matched & Updated: ${result.modifiedCount} documents`);

  } catch (error) {
    console.error("❌ Migration Error:", error);
  } finally {
    console.log("👋 Closing connection...");
    // Close the specific connection used for jobs
    await jobConnection.close();
    process.exit(0);
  }
};

migrateData();