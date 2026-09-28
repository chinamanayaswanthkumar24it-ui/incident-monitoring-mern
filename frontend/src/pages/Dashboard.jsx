import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, Siren, Building2, CheckCircle2, Bell, Search, Plus } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import IncidentCard from "../components/IncidentCard";
import LiveMap from "../components/LiveMap";
import ReportIncidentModal from "../components/ReportIncidentModal";
import { useAuth } from "../context/auth-context";
import { getIncidents, getIncidentStats } from "../api/incidents";
import { getHospitals } from "../api/hospitals";
import { getUnits } from "../api/police";
import { getSocket } from "../api/socket";

export default function Dashboard(){
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({ active: 0, resolvedToday: 0 });
  const [hospitalsOnline, setHospitalsOnline] = useState(0);
  const [respondingUnits, setRespondingUnits] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    setError("");
    try {
      const [incidentList, incidentStats, hospitals, units] = await Promise.all([
        getIncidents({ limit: 20 }),
        getIncidentStats(),
        getHospitals(),
        getUnits(),
      ]);
      setIncidents(incidentList);
      setStats(incidentStats);
      setHospitalsOnline(hospitals.filter((h) => h.status === "Online").length);
      setRespondingUnits(units.filter((u) => u.status !== "Offline").length);
    } catch (err) {
      setError(err.message || "Could not load the dashboard. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    const socket = getSocket();
    const onNew = (incident) => setIncidents((prev) => [incident, ...prev].slice(0, 20));
    const onUpdate = (incident) =>
      setIncidents((prev) => prev.map((i) => (i._id === incident._id ? incident : i)));
    const onDelete = ({ id }) => setIncidents((prev) => prev.filter((i) => i._id !== id));

    socket.on("incident:new", onNew);
    socket.on("incident:update", onUpdate);
    socket.on("incident:delete", onDelete);

    return () => {
      socket.off("incident:new", onNew);
      socket.off("incident:update", onUpdate);
      socket.off("incident:delete", onDelete);
    };
  }, []);

  const resolvedCount = incidents.filter((i) => i.status === "Resolved").length;
  const respondingCount = incidents.filter((i) => i.status === "Responding").length;

  const greetingName = user?.name?.split(" ")[0] || "there";

  return <div className="app-shell"><Navbar app/><div className="app-body"><Sidebar/><main className="dashboard">
    <div className="page-heading">
      <div><span className="section-kicker">COMMAND CENTER</span><h1>Welcome back, {greetingName}.</h1><p>Here is what's happening across your response network.</p></div>
      <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={17}/> Report incident</button>
    </div>

    {error && <div className="page-error">{error}</div>}

    <div className="stats-grid">
      <StatCard icon={AlertTriangle} label="Active incidents" value={loading ? "—" : stats.active} trend={`${respondingCount} responding`} tone="red"/>
      <StatCard icon={Siren} label="Units responding" value={loading ? "—" : respondingUnits} trend="Across the city" tone="orange"/>
      <StatCard icon={Building2} label="Hospitals online" value={loading ? "—" : hospitalsOnline} trend="Connected now" tone="blue"/>
      <StatCard icon={CheckCircle2} label="Resolved today" value={loading ? "—" : stats.resolvedToday} trend={`${resolvedCount} in this view`} tone="green"/>
    </div>

    <section className="dashboard-grid">
      <div className="map-panel panel" id="map">
        <div className="panel-head"><div><h2>Live incident map</h2><p><span className="live-dot"></span> Updating in real time</p></div><button className="icon-btn"><Search size={17}/></button></div>
        <LiveMap incidents={incidents}/>
      </div>
      <div className="incidents-panel panel">
        <div className="panel-head"><div><h2>Recent incidents</h2><p>Latest activity</p></div><span className="count-pill">{stats.active ?? 0} active</span></div>
        <div className="incident-list">
          {loading && <p className="empty-note">Loading incidents...</p>}
          {!loading && incidents.length === 0 && <p className="empty-note">No incidents reported yet.</p>}
          {incidents.slice(0, 6).map((i) => <IncidentCard incident={i} key={i._id}/>)}
        </div>
      </div>
    </section>

    <section className="activity-panel panel">
      <div className="panel-head"><div><h2>Response activity</h2><p>Live team updates</p></div><Bell size={18}/></div>
      {incidents.filter((i) => i.status !== "Reported").slice(0, 4).map((i) => (
        <div className="activity-row" key={i._id}>
          <span className={`activity-icon ${i.status === "Resolved" ? "green" : "blue"}`}>
            {i.status === "Resolved" ? <CheckCircle2/> : <Siren/>}
          </span>
          <div><b>{i.assignedUnit?.unitCode ? `Unit ${i.assignedUnit.unitCode}` : "A responder"} {i.status === "Resolved" ? "resolved" : "is handling"} {i.title}</b><small>{i.location?.address || "Location pending"}</small></div>
          <span className="activity-tag">{i.status?.toUpperCase()}</span>
        </div>
      ))}
      {incidents.filter((i) => i.status !== "Reported").length === 0 && !loading && (
        <p className="empty-note" style={{ padding: "16px 19px" }}>No recent response activity yet.</p>
      )}
    </section>
  </main></div>

  {showModal && (
    <ReportIncidentModal
      onClose={() => setShowModal(false)}
      onCreated={() => loadAll()}
    />
  )}
  </div>
}
