const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "127.0.0.1",
  database: "toko_2",
  password: "postgres",
  port: 5432,
});

pool.on("connect", () => {
  console.log("PostgreSQL CONNECTED ✅");
});

pool.on("error", (err) => {
  console.error("PostgreSQL ERROR ❌", err.message);
  // ❌ JANGAN process.exit()
});

module.exports = pool;
