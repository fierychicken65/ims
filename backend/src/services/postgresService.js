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
    component_id TEXT NOT NULL,
    status TEXT DEFAULT 'OPEN',
    severity TEXT,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    mttr INTERVAL
  );
`);

  await pool.query(`
  CREATE TABLE IF NOT EXISTS rca (
    id SERIAL PRIMARY KEY,
    work_item_id INT UNIQUE REFERENCES work_items(id) ON DELETE CASCADE,

    category TEXT NOT NULL,
    root_cause TEXT NOT NULL,
    fix TEXT NOT NULL,
    prevention TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);
  console.log("Postgres ready");
};

module.exports = {
  pool,
  initDB,
};
