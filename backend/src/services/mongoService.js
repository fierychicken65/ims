const mongoose = require("mongoose");

const connectMongo = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/ims");

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

const signalSchema = new mongoose.Schema({
  component_id: String,
  error: String,
  severity: String,
  timestamp: { type: Date, default: Date.now },
  work_item_id: Number,
});

const Signal = mongoose.model("Signal", signalSchema);

module.exports = {
  connectMongo,
  Signal,
};