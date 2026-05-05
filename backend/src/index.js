const express = require("express");
const signalRoutes = require("./routes/signalRoutes");
const { connectQueue } = require("./services/queueService");
const { connectMongo } = require("./services/mongoService");
const { initDB } = require("./services/postgresService");
const workItemRoutes = require("./routes/workItemRoutes");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/work-items", workItemRoutes);
app.use("/signal",signalRoutes);

app.get("/health",(req,res)=>{
    res.status(200).json({status:"ok"});
})
const PORT = 3000;

connectMongo();
initDB();
connectQueue();

const server = app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});

server.keepAliveTimeout = 5000;
server.headersTimeout = 6000;