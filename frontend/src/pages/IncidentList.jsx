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
            border: "1px solid #ccc",
            padding: "10px",
            margin: "10px",
            cursor: "pointer"
          }}
        >
          <b>{item.component_id}</b>
          <p>Status: {item.status}</p>
          <p>Severity: {item.severity}</p>
        </div>
      ))}
    </div>
  );
}

export default IncidentList;