const express = require("express");
const signalRoutes = require("./routes/signalRoutes");
const { connectQueue } = require("./services/queueService");
const { connectMongo } = require("./services/mongoService");
const { initDB } = require("./services/postgresService");
const workItemRoutes = require("./routes/workItemRoutes");

const app = express();
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

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});