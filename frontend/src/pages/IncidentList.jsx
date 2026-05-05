import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/work-items").then((res) => {
      setIncidents(res.data);
    });
  }, []);

  return (
    <div>
      <h2>Incidents</h2>

      {incidents.map((item) => (
        <div
          key={item.id}
          onClick={() => navigate(`/incident/${item.id}`)}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
            margin: "10px",
            cursor: "pointer",
            background: "#fff",
          }}
        >
          <h3>{item.component_id}</h3>

          <p>
            <b>Status:</b> {item.status}
          </p>
          <p>
            <b>Severity:</b> {item.severity}
          </p>

          <p>
            <b>Started:</b> {new Date(item.start_time).toLocaleString()}
          </p>

          {item.end_time && (
            <p>
              <b>Ended:</b> {new Date(item.end_time).toLocaleString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default IncidentList;
