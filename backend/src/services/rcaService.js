const { pool } = require("./postgresService");

const createRCA = async (workItemId, data) => {
  const { root_cause, fix, prevention } = data;

  if (!root_cause || !fix || !prevention) {
    throw new Error("Incomplete RCA");
  }

  await pool.query(
    `INSERT INTO rca (work_item_id, root_cause, fix, prevention)
     VALUES ($1, $2, $3, $4)`,
    [workItemId, root_cause, fix, prevention]
  );

  return { message: "RCA submitted" };
};

module.exports = { createRCA };