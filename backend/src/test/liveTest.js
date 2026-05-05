const fetch = require("node-fetch");

const URL = "http://localhost:3000/signal";

const components = [
  "CACHE_CLUSTER_01",
  "CACHE_CLUSTER_02",
  "DB_PRIMARY",
  "DB_REPLICA",
  "API_GATEWAY",
];

const severities = ["P0", "P1", "P2"];

const CONCURRENCY = 10; // increase for more load
const DELAY_MS = 100;   // delay between batches

let totalRequests = 0;
let running = true;

// graceful stop (Ctrl + C)
process.on("SIGINT", () => {
  console.log("\nStopping load test...");
  running = false;
});

// random helper
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// send single request
async function sendRequest() {
  const body = {
    component_id: random(components),
    error: "Timeout",
    severity: random(severities),
  };

  try {
    await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Connection": "close",
      },
      body: JSON.stringify(body),
    });

    totalRequests++;
  } catch (err) {
    // ignore errors for load test
  }
}

// run batch
async function runBatch() {
  const promises = [];

  for (let i = 0; i < CONCURRENCY; i++) {
    promises.push(sendRequest());
  }

  await Promise.all(promises);
}

// main loop
async function start() {
  console.log("Starting continuous load test...");

  while (running) {
    await runBatch();

    // small delay to avoid overwhelming instantly
    await new Promise((res) => setTimeout(res, DELAY_MS));
  }

  console.log(`Total requests sent: ${totalRequests}`);
}

start();

// log throughput every 5 sec
setInterval(() => {
  console.log(`Requests sent so far: ${totalRequests}`);
}, 5000);