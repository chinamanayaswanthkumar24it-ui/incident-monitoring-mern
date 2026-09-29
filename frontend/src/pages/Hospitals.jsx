import { useEffect, useState, useCallback } from "react";
import { Building2, BedDouble, Ambulance, HeartPulse, CheckCircle2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/auth-context";
import { getHospitals, updateHospital } from "../api/hospitals";
import { getIncidents } from "../api/incidents";
import { getSocket } from "../api/socket";
 

export default function Hospitals(){
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [incomingCases, setIncomingCases] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [callingAmbulance, setCallingAmbulance] = useState(false);

  const canManage = user?.role === "hospital" || user?.role === "admin";

  const load = useCallback(async () => {
    setError("");
    try {
      const [h, incidents] = await Promise.all([getHospitals(), getIncidents({ status: "Responding" })]);
      setHospitals(h);
      setIncomingCases(incidents.filter((i) => i.category === "Medical").length);
    } catch (err) {
      setError(err.message || "Could not load hospital data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const socket = getSocket();
    const refresh = () => load();
    socket.on("hospital:update", refresh);
    socket.on("incident:new", refresh);
    socket.on("incident:update", refresh);
    return () => {
      socket.off("hospital:update", refresh);
      socket.off("incident:new", refresh);
      socket.off("incident:update", refresh);
    };
  }, [load]);

 const bedsAvailable =
  hospitals.length > 0
    ? hospitals.reduce((sum, h) => sum + (h.bedsAvailable || 0), 0)
    : 100;

const bedsTotal =
  hospitals.length > 0
    ? hospitals.reduce((sum, h) => sum + (h.bedsTotal || 0), 0)
    : 100;

const ambulancesActive =
  hospitals.length > 0
    ? hospitals.reduce((sum, h) => sum + (h.ambulancesTotal || 0), 0)
    : 10;

const ambulancesAvailable =
  hospitals.length > 0
    ? hospitals.reduce((sum, h) => sum + (h.ambulancesAvailable || 0), 0)
    : 10;

const onlineCount =
  hospitals.length > 0
    ? hospitals.filter((h) => h.status === "Online").length
    : 5;
  const adjustBeds = async (hospital, delta) => {
    if (!canManage) return;
    const nextAvailable = Math.max(0, Math.min(hospital.bedsTotal, hospital.bedsAvailable + delta));
    setBusyId(hospital._id);
    try {
      const updated = await updateHospital(hospital._id, { bedsAvailable: nextAvailable });
      setHospitals((prev) => prev.map((h) => (h._id === updated._id ? updated : h)));
    } catch (err) {
      setError(err.message || "Could not update bed capacity.");
    } finally {
      setBusyId(null);
    }
  };

  return <AppPage>
    <div className="page-heading">
      <div><span className="section-kicker">HOSPITAL NETWORK</span><h1>Hospital readiness</h1><p>Monitor emergency capacity and incoming cases.</p></div>
      <button
  className="btn btn-primary"
  onClick={() => setCallingAmbulance(true)}
>
  <Ambulance size={17} />
  {callingAmbulance ? "Calling Ambulance 108..." : "Request ambulance"}
</button>
    </div>

    {error && <div className="page-error">{error}</div>}

    <div className="stats-grid">
      <StatCard icon={Building2} label="Hospitals online" value={loading ? "—" : onlineCount} trend={`of ${hospitals.length} total`} tone="blue"/>
      <StatCard icon={BedDouble} label="Emergency beds" value={loading ? "—" : bedsAvailable} trend={`of ${bedsTotal} total`} tone="green"/>
      <StatCard icon={Ambulance} label="Ambulances" value={loading ? "—" : ambulancesActive} trend={`${ambulancesAvailable} available`} tone="orange"/>
      <StatCard icon={HeartPulse} label="Incoming cases" value={loading ? "—" : incomingCases} trend="Medical responses" tone="red"/>
    </div>

    <div className="panel table-panel">
      <div className="panel-head"><div><h2>Hospital capacity</h2><p>{loading ? "Loading..." : "Updated moments ago"}</p></div><span className="count-pill">{onlineCount} connected</span></div>
      {!loading && hospitals.length === 0 && <p className="empty-note">No hospitals registered yet.</p>}
      {hospitals.map((h) => (
        <div className="hospital-row" key={h._id}>
          <span className="hospital-icon"><Building2/></span>
          <div className="grow"><b>{h.name}</b><small>{h.address || "Emergency department"}</small></div>
          <div className="capacity">
            <span>Beds</span>
            <strong>{h.bedsAvailable}{canManage ? (
              <span style={{ display: "inline-flex", gap: 4, marginLeft: 6 }}>
                <button className="icon-btn" style={{ width: 20, height: 20 }} disabled={busyId === h._id} onClick={() => adjustBeds(h, -1)}>-</button>
                <button className="icon-btn" style={{ width: 20, height: 20 }} disabled={busyId === h._id} onClick={() => adjustBeds(h, 1)}>+</button>
              </span>
            ) : null}</strong>
          </div>
          <span className={`status ${h.status === "Online" ? "available" : "busy"}`}><CheckCircle2 size={14}/> {h.status?.toUpperCase()}</span>
        </div>
      ))}
    </div>
  </AppPage>
}

function AppPage({children}){return <div className="app-shell"><Navbar app/><div className="app-body"><Sidebar/><main className="dashboard">{children}</main></div></div>}
