const { Pool } = require("pg");

const pool = new Pool({
  user: "ims_user",
  host: "localhost",
  database: "ims_db",
  password: "ims_pass",
  port: 5432,
});

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS work_items (
      id SERIAL PRIMARY KEY,
      component_id TEXT,
      status TEXT DEFAULT 'OPEN',
      severity TEXT,
      start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Postgres ready");
};

module.exports = {
  pool,
  initDB,
};