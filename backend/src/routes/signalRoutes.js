const express = require("express");
const router = express.Router();
const {ingestSignal} = require("../controllers/signalController");
// Define your routes here

router.post("/",ingestSignal);

module.exports = router;