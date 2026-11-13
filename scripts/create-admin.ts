/**
 * Run after first signup to promote user to admin:
 * npx tsx scripts/create-admin.ts admin@school.local
 */
import Database from "better-sqlite3";
import path from "path";

const email = process.argv[2] || "admin@school.local";
const dbPath = path.join(process.cwd(), "data", "calendar.db");
const db = new Database(dbPath);

const result = db.prepare("UPDATE user SET role = 'admin' WHERE email = ?").run(email);
console.log(`Updated ${result.changes} user(s) with email ${email} to role=admin`);
db.close();
