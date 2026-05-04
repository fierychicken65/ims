const { pool } = require("./postgresService");

const getOrCreateWorkItem = async (signal) => {
  
  const existing = await pool.query(
    `SELECT id FROM work_items
     WHERE component_id = $1 AND status = 'OPEN'
     LIMIT 1`,
    [signal.component_id]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].id;
  }

  const result = await pool.query(
    `INSERT INTO work_items (component_id, severity)
     VALUES ($1, $2)
     RETURNING id`,
    [signal.component_id, signal.severity]
  );

  const id = result.rows[0].id;

  console.log("Created NEW Work Item:", id);

  return id;
};

module.exports = { getOrCreateWorkItem };