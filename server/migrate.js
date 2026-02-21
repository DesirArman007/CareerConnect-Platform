import "dotenv/config";
import { jobConnection } from "./src/config/jobConnection.js";
import Job from "./src/models/jobModel.js";

const migrateData = async () => {
  try {
    console.log("⏳ Connecting to database...");

    if (jobConnection.readyState !== 1) {
      await new Promise((resolve, reject) => {
        jobConnection.once("open", resolve);
        jobConnection.once("error", reject);
      });
    }

    console.log("✅ Connected! Starting migration...");

    // 1️⃣ Rename job_id → jobId (aggregation pipeline REQUIRED)
    const renameResult = await Job.updateMany(
      { job_id: { $exists: true } },
      [
        {
          $set: {
            jobId: "$job_id"
          }
        },
        {
          $unset: "job_id"
        }
      ]
    );

    console.log(` job_id → jobId migrated: ${renameResult.modifiedCount}`);

    const jobliveResult = await Job.updateMany(
      { joblive: { $exists: false } },
      { $set: { joblive: true } }
    );

    const closedAtResult = await Job.updateMany(
      { closedAt: { $exists: false } },
      { $set: { closedAt: null } }
    );

    const lastSeenResult = await Job.updateMany(
      { last_seen: { $exists: false } },
      { $set: { last_seen: null } }
    );

    console.log("✅ Backfill complete:");
    console.log(`- joblive set: ${jobliveResult.modifiedCount}`);
    console.log(`- closedAt set: ${closedAtResult.modifiedCount}`);
    console.log(`- last_seen set: ${lastSeenResult.modifiedCount}`);

     const userResult = await User.updateMany(
      {},
      {
        $set: {
          status: "ACTIVE",
          lastActiveAt: null,
          lastLoginAt: null
        }
      }
    );

    console.log("✅ Users backfill complete:");
    console.log(`- users normalized: ${userResult.modifiedCount}`);

    console.log("🎉 Migration completed successfully!");

    console.log("🎉 Migration completed successfully!");

  } catch (error) {
    console.error("❌ Migration Error:", error);
  } finally {
    console.log("👋 Closing connection...");
    await jobConnection.close();
    process.exit(0);
  }
};

migrateData();
