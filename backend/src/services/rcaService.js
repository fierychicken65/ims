const { pool } = require("./postgresService");

const createRCA = async (workItemId, data) => {
  const { category, root_cause, fix, prevention, end_time } = data;

  // 🔴 1. Validate required fields
  if (!category || !root_cause || !fix || !prevention) {
    throw new Error("Incomplete RCA");
  }

  // 🔴 2. Fetch work item
  const result = await pool.query(
    "SELECT * FROM work_items WHERE id = $1",
    [workItemId]
  );

  if (result.rows.length === 0) {
    throw new Error("Work item not found");
  }

  const workItem = result.rows[0];

  // 🔴 3. Prevent RCA for CLOSED
  if (workItem.status === "CLOSED") {
    throw new Error("Cannot submit RCA for closed incident");
  }

  // 🔴 4. Prevent duplicate RCA
  const existing = await pool.query(
    "SELECT * FROM rca WHERE work_item_id = $1",
    [workItemId]
  );

  if (existing.rows.length > 0) {
    throw new Error("RCA already exists");
  }

  // 🔴 5. Validate end_time
  if (end_time) {
    const startTime = new Date(workItem.start_time);
    const endTime = new Date(end_time);

    if (endTime < startTime) {
      throw new Error("End time cannot be before start time");
    }
  }

  // 🔴 6. Insert RCA
  await pool.query(
    `INSERT INTO rca (work_item_id, category, root_cause, fix, prevention)
     VALUES ($1, $2, $3, $4, $5)`,
    [workItemId, category, root_cause, fix, prevention]
  );

  // 🔴 7. Update end_time + MTTR
  const finalEndTime = end_time || new Date().toISOString();

  await pool.query(
    `UPDATE work_items
     SET end_time = $1,
         mttr = ($1 - start_time)
     WHERE id = $2`,
    [finalEndTime, workItemId]
  );

  return { message: "RCA submitted successfully" };
};

module.exports = { createRCA };