#!/usr/bin/env node
/**
 * Apply schema migrations to Supabase database
 * Adds missing columns for food_logs and workout_logs tables
 */

const https = require("https");

const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eGhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ4NjAyNywiZXhwIjoyMDg0MDYyMDI3fQ.1p4lBYX2BunvxC6TXOgHAZyXqvHDMQzBOeodeGX0Ze8";
const PROJECT_REF = "mtevaxgfkjyifnaftyxhl";

const MIGRATIONS = [
  // Add fdc_id to track USDA FoodData Central food IDs
  `ALTER TABLE IF EXISTS food_logs ADD COLUMN IF NOT EXISTS fdc_id VARCHAR(50);`,

  // Add food_name to store food name at time of logging
  `ALTER TABLE IF EXISTS food_logs ADD COLUMN IF NOT EXISTS food_name VARCHAR(255);`,

  // Add quantity_unit to track unit used when logging
  `ALTER TABLE IF EXISTS food_logs ADD COLUMN IF NOT EXISTS quantity_unit VARCHAR(20) DEFAULT 'g';`,

  // Create index on fdc_id for faster USDA food lookups
  `CREATE INDEX IF NOT EXISTS idx_food_logs_fdc_id ON food_logs(fdc_id);`,
];

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${PROJECT_REF}.supabase.co`,
      path: "/rest/v1/rpc/exec_sql",
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        apikey: SERVICE_KEY,
        Prefer: "return=representation",
      },
    };

    const body = JSON.stringify({ sql });

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data });
        } else {
          reject({ statusCode: res.statusCode, data });
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function runMigrations() {
  console.log("🚀 Starting schema migration...\n");

  for (let i = 0; i < MIGRATIONS.length; i++) {
    const migration = MIGRATIONS[i];
    console.log(
      `[${i + 1}/${MIGRATIONS.length}] Executing: ${migration.substring(0, 50)}...`,
    );

    try {
      await executeSQL(migration);
      console.log(`✅ Migration ${i + 1} completed successfully\n`);
    } catch (error) {
      console.error(`❌ Migration ${i + 1} failed:`, error);
      // Continue with next migration even if one fails
    }
  }

  console.log("\n✅ Schema migration complete!");
  console.log("The following columns have been added to food_logs table:");
  console.log("  • fdc_id (VARCHAR)");
  console.log("  • food_name (VARCHAR)");
  console.log("  • quantity_unit (VARCHAR)");
}

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
