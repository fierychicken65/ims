const { pool } = require("./postgresService");
const { Signal } = require("./mongoService");

// Get all incidents
const getAllIncidents = async () => {
  const result = await pool.query(
    "SELECT * FROM work_items ORDER BY start_time DESC"
  );

  return result.rows;
};

// Get single incident + signals
const getIncidentById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM work_items WHERE id = $1",
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Incident not found");
  }

  const incident = result.rows[0];

  // 🔥 Fetch related signals from Mongo
  const signals = await Signal.find({ work_item_id: id });

  return {
    ...incident,
    signals
  };
};

module.exports = {
  getAllIncidents,
  getIncidentById
};