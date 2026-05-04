const express = require("express");
const router = express.Router();

const {
  changeStatus,
  submitRCA,
  getIncidents,
  getIncident
} = require("../controllers/workItemController");

router.get("/", getIncidents);
router.get("/:id", getIncident);
router.patch("/:id/status", changeStatus);
router.post("/:id/rca", submitRCA);

module.exports = router;