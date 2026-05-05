const express = require("express");
const signalRoutes = require("./routes/signalRoutes");
const workItemRoutes = require("./routes/workItemRoutes");

const { connectQueue } = require("./services/queueService");
const { connectMongo } = require("./services/mongoService");
const { initDB } = require("./services/postgresService");

const rateLimit = require("express-rate-limit");
const cors = require("cors");

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 1000, // 1 sec
  max: 50,        // 50 req/sec
});

app.use("/signal", limiter);

/* -------------------- THROUGHPUT METRICS -------------------- */
let signalCount = 0;

app.use("/signal", (req, res, next) => {
  signalCount++;
  next();
});

setInterval(() => {
  console.log(`Signals/sec: ${(signalCount / 5).toFixed(2)}`);
  signalCount = 0;
}, 5000);

/* -------------------- ROUTES -------------------- */
app.use("/signal", signalRoutes);
app.use("/work-items", workItemRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/* -------------------- STARTUP -------------------- */
const PORT = 3000;

connectMongo();
initDB();
connectQueue();

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* -------------------- TIMEOUTS -------------------- */
server.keepAliveTimeout = 5000;
server.headersTimeout = 6000;