import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function IncidentDetail() {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);

  const [rca, setRca] = useState({
    root_cause: "",
    fix: "",
    prevention: "",
  });
  const nextStatusMap = {
    OPEN: "INVESTIGATING",
    INVESTIGATING: "RESOLVED",
    RESOLVED: "CLOSED",
  };
  useEffect(() => {
    API.get(`/work-items/${id}`).then((res) => {
      setIncident(res.data);
    });
  }, [id]);

  const submitRCA = async () => {
    await API.post(`/work-items/${id}/rca`, rca);
    alert("RCA submitted");
  };

  const changeStatus = async (newStatus) => {
    try {
      await API.patch(`/work-items/${id}/status`, {
        status: newStatus,
      });

      alert(`Status updated to ${newStatus}`);

      // refresh data
      const res = await API.get(`/work-items/${id}`);
      setIncident(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Error updating status");
    }
  };

  if (!incident) return <p>Loading...</p>;
  const isClosed = incident.status === "CLOSED";
  return (
    <div>
      <h2>{incident.component_id}</h2>
      <p
        style={{
          fontWeight: "bold",
          color:
            incident.status === "OPEN"
              ? "red"
              : incident.status === "INVESTIGATING"
                ? "orange"
                : incident.status === "RESOLVED"
                  ? "blue"
                  : "green",
        }}
      >
        Status: {incident.status}
      </p>
      <p
        style={{
          color:
            incident.severity === "P0"
              ? "red"
              : incident.severity === "P1"
                ? "orange"
                : "blue",
        }}
      >
        Severity: {incident.severity}
      </p>
      <h3>Submit RCA</h3>

      <input
        placeholder="Root Cause"
        disabled={isClosed}
        onChange={(e) => setRca({ ...rca, root_cause: e.target.value })}
      />

      <input
        placeholder="Fix"
        disabled={isClosed}
        onChange={(e) => setRca({ ...rca, fix: e.target.value })}
      />

      <input
        placeholder="Prevention"
        disabled={isClosed}
        onChange={(e) => setRca({ ...rca, prevention: e.target.value })}
      />

      <button onClick={submitRCA} disabled={isClosed}>
        Submit RCA
      </button>
      {isClosed && (
        <p style={{ color: "red" }}>
          RCA already submitted. Incident is closed.
        </p>
      )}

      <h3>Status Actions</h3>

      {incident.status !== "CLOSED" && (
        <button onClick={() => changeStatus(nextStatusMap[incident.status])}>
          Move to {nextStatusMap[incident.status]}
        </button>
      )}

      <h3>Signals</h3>

      {incident.signals.map((s, i) => (
        <div key={i}>
          {s.error} - {s.severity}
        </div>
      ))}
    </div>
  );
}

export default IncidentDetail;
