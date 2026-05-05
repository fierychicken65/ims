import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

  if (!incident) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center"><p className="text-white text-lg">Loading...</p></div>;

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

  const getStatusColor = (status) => {
    if (status === "OPEN") return "bg-red-600";
    if (status === "INVESTIGATING") return "bg-yellow-600";
    if (status === "RESOLVED") return "bg-blue-600";
    if (status === "CLOSED") return "bg-green-600";
    return "bg-slate-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* INCIDENT INFO */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg p-8 mb-8 shadow-lg">
          <h2 className="text-4xl font-bold text-white mb-6">{incident.component_id}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-200">
            <div>
              <p className="text-sm text-slate-400 mb-1">Status</p>
              <p className={`text-lg font-semibold px-3 py-1 ${getStatusColor(incident.status)} rounded w-fit text-white`}>{incident.status}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-1">Severity</p>
              <p className={`text-lg font-semibold px-3 py-1 rounded w-fit text-white ${
                getSeverityColor(incident.severity) === 'red' ? 'bg-red-600' :
                getSeverityColor(incident.severity) === 'orange' ? 'bg-orange-600' :
                'bg-blue-600'
              }`}>
                {incident.severity}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-1">Started</p>
              <p className="text-slate-200">{new Date(incident.start_time).toLocaleString()}</p>
            </div>

            {incident.end_time && (
              <div>
                <p className="text-sm text-slate-400 mb-1">Ended</p>
                <p className="text-slate-200">{new Date(incident.end_time).toLocaleString()}</p>
              </div>
            )}

            {incident.mttr && (
              <div className="md:col-span-2">
                <p className="text-sm text-slate-400 mb-1">MTTR</p>
                <p className="text-slate-200 text-lg font-semibold">
                  {incident.mttr.days > 0 && `${incident.mttr.days}d `}
                  {incident.mttr.hours}h {incident.mttr.minutes}m
                </p>
              </div>
            )}
          </div>
        </div>

        {/* STATUS BUTTON */}
        <div className="mb-8">
          {incident.status !== "CLOSED" && (
            <button 
              onClick={() => changeStatus(nextStatusMap[incident.status])}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              Move to {nextStatusMap[incident.status]}
            </button>
          )}
        </div>

        {/* SIGNAL GRAPH */}
        {incident.signals && incident.signals.length > 0 && (
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg p-8 mb-8 shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-6">Signal Timeline</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={(() => {
                  const grouped = {};
                  [...incident.signals]
                    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                    .forEach((s) => {
                      const d = new Date(s.timestamp);
                      const key = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
                      if (!grouped[key]) {
                        grouped[key] = { time: key, P0: 0, P1: 0, P2: 0 };
                      }
                      grouped[key][s.severity] += 1;
                    });
                  return Object.values(grouped);
                })()}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis
                  stroke="#94a3b8"
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  label={{ value: "Signal Count", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                  labelStyle={{ color: "#94a3b8" }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="P0"
                  name="P0"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="P1"
                  name="P1"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: "#f97316", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="P2"
                  name="P2"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* RCA FORM */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg p-8 mb-8 shadow-lg">
          <h3 className="text-2xl font-bold text-white mb-6">Submit RCA</h3>

          {isClosed && (
            <div className="mb-6 p-4 bg-red-900 border border-red-600 rounded-lg">
              <p className="text-red-200">
                ✓ RCA already submitted. Incident is closed.
              </p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-slate-300 font-semibold mb-2">End Time</label>
              <input
                type="datetime-local"
                value={rca.end_time}
                disabled={isClosed}
                min={new Date(incident.start_time).toISOString().slice(0, 16)}
                onChange={(e) => setRca({ ...rca, end_time: e.target.value })}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Category</label>
              <select
                disabled={isClosed}
                onChange={(e) => setRca({ ...rca, category: e.target.value })}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Select</option>
                <option value="INFRA">Infrastructure</option>
                <option value="CODE">Code Issue</option>
                <option value="NETWORK">Network</option>
                <option value="DEPENDENCY">Dependency</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Root Cause</label>
              <textarea
                disabled={isClosed}
                onChange={(e) => setRca({ ...rca, root_cause: e.target.value })}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 h-24 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Fix</label>
              <textarea
                disabled={isClosed}
                onChange={(e) => setRca({ ...rca, fix: e.target.value })}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 h-24 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Prevention</label>
              <textarea
                disabled={isClosed}
                onChange={(e) => setRca({ ...rca, prevention: e.target.value })}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 h-24 resize-none"
              />
            </div>

            <button 
              onClick={submitRCA} 
              disabled={isClosed}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit RCA
            </button>
          </div>
        </div>

        {/* SIGNALS */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-white mb-6">Signals</h3>
          <div className="space-y-3">
            {incident.signals && incident.signals.length > 0 ? (
              [...incident.signals]
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((s, i) => (
                <div 
                  key={i}
                  className="p-3 bg-slate-600 rounded-lg text-slate-200 border-l-4 border-blue-500"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-semibold">{s.error}</p>
                    <p className="text-xs text-slate-400">{new Date(s.timestamp).toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">Severity: <span className="text-slate-200">{s.severity}</span></p>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No signals recorded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncidentDetail;
