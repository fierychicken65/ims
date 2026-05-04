class P0Strategy {
  handle(signal) {
    console.log(`🚨 [P0 ALERT] Immediate action required for ${signal.component_id}`);
  }
}

class P1Strategy {
  handle(signal) {
    setTimeout(() => {
      console.log(`⚠️ [P1 ALERT] Delayed alert for ${signal.component_id}`);
    }, 5000); // 5 sec delay
  }
}

class P2Strategy {
  handle(signal) {
    console.log(`ℹ️ [P2 LOG] Minor issue in ${signal.component_id}`);
  }
}

module.exports = {
  P0Strategy,
  P1Strategy,
  P2Strategy
};