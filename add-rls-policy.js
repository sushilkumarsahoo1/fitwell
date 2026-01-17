#!/usr/bin/env node

/**
 * Add RLS Policy for Public Foods
 * Allows anyone to create public foods (for USDA placeholder)
 */

const https = require("https");

const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eGhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ4NjAyNywiZXhwIjoyMDg0MDYyMDI3fQ.1p4lBYX2BunvxC6TXOgHAZyXqvHDMQzBOeodeGX0Ze8";
const PROJECT_ID = "mtevaxgfkjyifnaftxhl";

function makeRequest(path, method = "POST", body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: PROJECT_ID + ".supabase.co",
      port: 443,
      path: path,
      method: method,
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.headers["Content-Length"] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function executeSQL(sql) {
  const payload = JSON.stringify({ query: sql });

  try {
    const response = await makeRequest(
      "/rest/v1/rpc/exec_sql",
      "POST",
      payload,
    );

    if (response.status >= 400) {
      console.log(`❌ Error: ${response.status}`);
      console.log(`Body: ${response.body}`);
      return false;
    }

    console.log("✅ Policy added successfully");
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("\n🔐 Adding RLS Policy for Public Foods...\n");

  const sql = `
    DROP POLICY IF EXISTS "Anyone can create public foods" ON foods;
    CREATE POLICY "Anyone can create public foods" ON foods
      FOR INSERT WITH CHECK (is_custom = FALSE AND user_id IS NULL);
  `;

  const success = await executeSQL(sql);

  if (success) {
    console.log("\n✅ RLS Policy Added\n");
    process.exit(0);
  } else {
    console.log("\n❌ Failed to add RLS policy\n");
    process.exit(1);
  }
}

main();
