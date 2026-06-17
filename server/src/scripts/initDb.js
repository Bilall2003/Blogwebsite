import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, "../../db/schema.sql");

async function run() {
  const sql = fs.readFileSync(schemaPath, "utf8");

  // Connect without selecting a database so CREATE DATABASE can run.
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  try {
    await conn.query(sql);
    console.log("Database schema applied successfully.");
  } finally {
    await conn.end();
  }
}

run().catch((err) => {
  console.error("Failed to apply schema:", err.message);
  process.exit(1);
});
