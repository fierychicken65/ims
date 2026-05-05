const { pool } = require("../services/postgresService");

async function getOrCreateWorkItem(signal) {
  let { component_id, severity } = signal;

  // 🔥 normalize (important)
  component_id = component_id.trim().toUpperCase();

  // 🔥 try to find existing OPEN incident
  const existing = await pool.query(
    `SELECT id, severity FROM work_items
     WHERE component_id = $1
     AND status != 'CLOSED'
     ORDER BY start_time DESC
     LIMIT 1`,
    [component_id]
  );

  if (existing.rows.length > 0) {
    const workItemId = existing.rows[0].id;
    const currentSeverity = existing.rows[0].severity;

    // 🔥 severity escalation only (optional but better)
    const rank = { P0: 3, P1: 2, P2: 1 };

    if (rank[severity] > rank[currentSeverity]) {
      await pool.query(
        `UPDATE work_items
         SET severity = $1
         WHERE id = $2`,
        [severity, workItemId]
      );
    }

    return { id: workItemId, isNew: false };
  }

  // 🔥 CREATE NEW (with race protection)
  try {
    const result = await pool.query(
      `INSERT INTO work_items (component_id, severity)
       VALUES ($1, $2)
       RETURNING id`,
      [component_id, severity]
    );

    const newId = result.rows[0].id;

    console.log("Created Work Item:", newId);

    return { id: newId, isNew: true };
  } catch (err) {
    // 🔥 HANDLE RACE CONDITION (very important)
    const retry = await pool.query(
      `SELECT id FROM work_items
       WHERE component_id = $1
       AND status != 'CLOSED'
       LIMIT 1`,
      [component_id]
    );

    if (retry.rows.length > 0) {
      return { id: retry.rows[0].id, isNew: false };
    }

    throw err;
  }
}

module.exports = { getOrCreateWorkItem };