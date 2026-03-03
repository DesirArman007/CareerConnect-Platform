import "dotenv/config";
import { jobConnection } from "./src/config/jobConnection.js";
import Job from "./src/models/jobModel.js";
import { logger } from "./src/config/logger.js";

const migrateData = async () => {
  try {
    logger.info("Connecting to database...");

    if (jobConnection.readyState !== 1) {
      await new Promise((resolve, reject) => {
        jobConnection.once("open", resolve);
        jobConnection.once("error", reject);
      });
    }

    logger.info("Connected! Starting migration...");

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

    logger.info({ migratedCount: renameResult.modifiedCount }, "job_id → jobId migrated");

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

    logger.info({
      jobliveSet: jobliveResult.modifiedCount,
      closedAtSet: closedAtResult.modifiedCount,
      lastSeenSet: lastSeenResult.modifiedCount,
    }, "Backfill complete");

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

    logger.info({ usersNormalized: userResult.modifiedCount }, "Users backfill complete");

    logger.info("Migration completed successfully!");

    logger.info("Migration completed successfully!");

  } catch (error) {
    logger.error({ err: error }, "Migration Error");
  } finally {
    logger.info("Closing connection...");
    await jobConnection.close();
    process.exit(0);
  }
};

migrateData();
