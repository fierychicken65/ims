import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    severity: "",
  });

  const severityOrder = {
    P0: 0,
    P1: 1,
    P2: 2,
  };

  const getStatusColor = (status) => {
    if (status === "OPEN") return "bg-red-600";
    if (status === "INVESTIGATING") return "bg-yellow-600";
    if (status === "RESOLVED") return "bg-blue-600";
    if (status === "CLOSED") return "bg-green-600";
    return "bg-slate-600";
  };

  const navigate = useNavigate();

  const fetchIncidents = async () => {
    const res = await API.get("/work-items");
    setIncidents(res.data);
  };


  useEffect(() => {
    fetchIncidents();

    const interval = setInterval(fetchIncidents, 5000); // every 5 sec

    return () => clearInterval(interval);
  }, []);

  const filteredIncidents = incidents
    .filter((item) => {
      return (
        (!filters.status || item.status === filters.status) &&
        (!filters.severity || item.severity === filters.severity)
      );
    })
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-white mb-8">Incidents</h2>
        
        <div className="mb-8 flex gap-4 flex-wrap">
          <select
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="OPEN">OPEN</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          <select
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severity</option>
            <option value="P0">P0</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
          </select>
        </div>

        {filteredIncidents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No incidents found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIncidents.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/incident/${item.id}`)}
                className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg p-6 cursor-pointer hover:shadow-2xl hover:border-blue-500 transition-all transform hover:scale-105 active:scale-95"
              >
                <h3 className="text-xl font-bold text-white mb-4">{item.component_id}</h3>

                <div className="space-y-2 text-sm">
                  <p className="text-slate-300">
                    <b className="text-slate-200">Status:</b> <span className={`ml-2 px-2 py-1 rounded font-semibold text-white ${getStatusColor(item.status)}`}>{item.status}</span>
                  </p>
                  <p className="text-slate-300">
                    <b className="text-slate-200">Severity:</b> 
                    <span className={`ml-2 px-2 py-1 rounded font-semibold ${
                      item.severity === 'P0' ? 'bg-red-600 text-white' :
                      item.severity === 'P1' ? 'bg-orange-600 text-white' :
                      'bg-blue-600 text-white'
                    }`}>
                      {item.severity}
                    </span>
                  </p>

                  <p className="text-slate-300 text-xs">
                    <b className="text-slate-200">Started:</b> {new Date(item.start_time).toLocaleString()}
                  </p>

                  {item.end_time && (
                    <p className="text-slate-300 text-xs">
                      <b className="text-slate-200">Ended:</b> {new Date(item.end_time).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default IncidentList;
