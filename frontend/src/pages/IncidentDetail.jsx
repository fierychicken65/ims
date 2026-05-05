import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function IncidentDetail() {
  const { id } = useParams();

  const [incident, setIncident] = useState(null);

  const [rca, setRca] = useState({
    end_time: "",
    category: "",
    root_cause: "",
    fix: "",
    prevention: "",
  });

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const fetchIncident = async () => {
    const res = await API.get(`/work-items/${id}`);
    setIncident(res.data);
  };

  const submitRCA = async () => {
    try {
      await API.post(`/work-items/${id}/rca`, rca);
      alert("RCA submitted");
      fetchIncident();
    } catch (err) {
      alert(err.response?.data?.error || "Error submitting RCA");
    }
  };

  const changeStatus = async (newStatus) => {
    try {
      await API.patch(`/work-items/${id}/status`, {
        status: newStatus,
      });

      fetchIncident();
    } catch (err) {
      alert(err.response?.data?.error);
    }
  };

  if (!incident) return <p>Loading...</p>;

  const isClosed = incident.status === "CLOSED";

  const nextStatusMap = {
    OPEN: "INVESTIGATING",
    INVESTIGATING: "RESOLVED",
    RESOLVED: "CLOSED",
  };

  const getSeverityColor = (sev) => {
    if (sev === "P0") return "red";
    if (sev === "P1") return "orange";
    return "blue";
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* INCIDENT INFO */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2>{incident.component_id}</h2>

        <p>Status: {incident.status}</p>

        <p style={{ color: getSeverityColor(incident.severity) }}>
          Severity: {incident.severity}
        </p>

        <p>Start: {new Date(incident.start_time).toLocaleString()}</p>

        {incident.end_time && (
          <p>End: {new Date(incident.end_time).toLocaleString()}</p>
        )}

        {incident.mttr && (
          <p>
            MTTR: {incident.mttr.days > 0 && `${incident.mttr.days}d `}
            {incident.mttr.hours}h {incident.mttr.minutes}m
          </p>
        )}
      </div>

      {/* STATUS BUTTON */}
      <div style={{ marginTop: "20px" }}>
        {incident.status !== "CLOSED" && (
          <button onClick={() => changeStatus(nextStatusMap[incident.status])}>
            Move to {nextStatusMap[incident.status]}
          </button>
        )}
      </div>

      {/* RCA FORM */}
      <div style={{ marginTop: "20px" }}>
        <h3>Submit RCA</h3>

        {isClosed && (
          <p style={{ color: "red" }}>
            RCA already submitted. Incident is closed.
          </p>
        )}

        <label>End Time</label>
        <input
          type="datetime-local"
          value={rca.end_time}
          disabled={isClosed}
          min={new Date(incident.start_time).toISOString().slice(0, 16)}
          onChange={(e) => setRca({ ...rca, end_time: e.target.value })}
        />

        <label>Category</label>
        <select
          disabled={isClosed}
          onChange={(e) => setRca({ ...rca, category: e.target.value })}
        >
          <option value="">Select</option>
          <option value="INFRA">Infrastructure</option>
          <option value="CODE">Code Issue</option>
          <option value="NETWORK">Network</option>
          <option value="DEPENDENCY">Dependency</option>
        </select>

        <label>Root Cause</label>
        <textarea
          disabled={isClosed}
          onChange={(e) => setRca({ ...rca, root_cause: e.target.value })}
        />

        <label>Fix</label>
        <textarea
          disabled={isClosed}
          onChange={(e) => setRca({ ...rca, fix: e.target.value })}
        />

        <label>Prevention</label>
        <textarea
          disabled={isClosed}
          onChange={(e) => setRca({ ...rca, prevention: e.target.value })}
        />

        <button onClick={submitRCA} disabled={isClosed}>
          Submit RCA
        </button>
      </div>

      {/* SIGNALS */}
      <div style={{ marginTop: "20px" }}>
        <h3>Signals</h3>
        {incident.signals.map((s, i) => (
          <div key={i}>
            {s.error} - {s.severity}
          </div>
        ))}
      </div>
    </div>
  );
}

export default IncidentDetail;
