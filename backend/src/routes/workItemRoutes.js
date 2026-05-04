const express = require("express");
const router = express.Router();

const { changeStatus, submitRCA } = require("../controllers/workItemController");

router.patch("/:id/status", changeStatus);
router.post("/:id/rca", submitRCA);

module.exports = router;