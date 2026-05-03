const express = require("express");
const signalRoutes = require("./routes/signalRoutes");
const { connectQueue } = require("./services/queueService");


const app = express();
app.use(express.json());

app.use("/signal",signalRoutes);

app.get("/health",(req,res)=>{
    res.status(200).json({status:"ok"});
})
const PORT = 3000;

connectQueue();
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});