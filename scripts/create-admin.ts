import { createClient } from "@libsql/client";

const email = process.argv[2] || "admin@school.local";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function makeAdmin() {
  const result = await client.execute({
    sql: "UPDATE user SET role = 'admin' WHERE email = ?",
    args: [email],
  });

  console.log(
    `Updated ${result.rowsAffected} user(s) with email ${email} to role=admin`
  );
}

makeAdmin().catch(console.error);
