const { sendToQueue } = require("../services/queueService");

exports.ingestSignal = async (req, res) => {
  try {
    const { component_id, timestamp, error, severity } = req.body;

    if (!component_id || !error) {
      return res.status(400).json({
        message: "component_id and error are required",
      });
    }

    console.log("Signal received:", req.body);

    sendToQueue(req.body);
    return res.status(202).json({
      message: "Signal queued",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};