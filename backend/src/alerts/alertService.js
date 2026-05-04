const {
  P0Strategy,
  P1Strategy,
  P2Strategy
} = require("./alertStrategies");

const strategyMap = {
  P0: new P0Strategy(),
  P1: new P1Strategy(),
  P2: new P2Strategy()
};

const handleAlert = (signal) => {
  const strategy = strategyMap[signal.severity];

  if (!strategy) {
    console.log("Unknown severity");
    return;
  }

  strategy.handle(signal);
};

module.exports = { handleAlert };