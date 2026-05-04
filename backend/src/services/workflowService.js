const { pool } = require("./postgresService");

const validTransitions = {
  OPEN: ["INVESTIGATING"],
  INVESTIGATING: ["RESOLVED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
};

const updateStatus = async (workItemId, newStatus) => {
  // 1. Get current status
  const result = await pool.query(
    "SELECT status FROM work_items WHERE id = $1",
    [workItemId],
  );

  if (result.rows.length === 0) {
    throw new Error("Work item not found");
  }

  const currentStatus = result.rows[0].status;

  // 2. Validate transition
  if (!validTransitions[currentStatus].includes(newStatus)) {
    throw new Error(`Invalid transition: ${currentStatus} → ${newStatus}`);
  }

  // 3. If closing, check RCA
  if (newStatus === "CLOSED") {
    const rcaCheck = await pool.query(
      "SELECT * FROM rca WHERE work_item_id = $1",
      [workItemId],
    );

    if (rcaCheck.rows.length === 0) {
      throw new Error("Cannot close without RCA");
    }

    // set end_time
    await pool.query(
        `UPDATE work_items 
        SET end_time = CURRENT_TIMESTAMP,
            mttr = (CURRENT_TIMESTAMP - start_time)::INTERVAL
        WHERE id = $1`,
        [workItemId]
    );
  }

  // 4. Update status
  await pool.query("UPDATE work_items SET status = $1 WHERE id = $2", [
    newStatus,
    workItemId,
  ]);

  return { message: "Status updated successfully" };
};

module.exports = { updateStatus };
