const { updateStatus } = require("../services/workflowService");
const { createRCA } = require("../services/rcaService");
const {
  getAllIncidents,
  getIncidentById
} = require("../services/incidentService");


exports.changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await updateStatus(id, status);

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.submitRCA = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await createRCA(id, req.body);

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.getIncidents = async (req, res) => {
  try {
    const data = await getAllIncidents();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getIncident = async (req, res) => {
  try {
    const data = await getIncidentById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};