const fetch = require("node-fetch");

const URL = "http://localhost:3000/signal";

const components = [
  "CACHE_CLUSTER_01",
  "CACHE_CLUSTER_03",
  "DB_PRIMARY_03",
  "DB_REPLICA_03",
  "API_GATEWAY_10"
];

const severities = ["P0", "P1", "P2"];

const TOTAL_REQUESTS = 10000;
const CONCURRENCY = 1000;

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function sendRequest() {
  const body = {
    component_id: random(components),
    error: "Timeout",
    severity: random(severities)
  };

  try {
    await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Connection": "close" // 🔥 important
      },
      body: JSON.stringify(body)
    });
  } catch (err) {}
}

async function runLoadTest() {
  let running = [];

  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    const req = sendRequest();
    running.push(req);

    if (running.length >= CONCURRENCY) {
      await Promise.all(running);
      running = [];
    }
  }

  // flush remaining
  if (running.length > 0) {
    await Promise.all(running);
  }

  console.log("Load test complete");
}

runLoadTest();