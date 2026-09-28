import { useEffect, useState, useCallback } from "react";
import { Users, ShieldCheck, Activity, Database, Settings2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import { getAdminStats, getSystemHealth, getUsers, updateUser, deleteUser } from "../api/admin";

const ROLE_ORDER = ["user", "police", "hospital", "admin"];
const ROLE_COLOR = { user: "#2563eb", police: "#4f83f1", hospital: "#91b1f5", admin: "#c8d8fa" };

export default function Admin(){
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const [s, h, u] = await Promise.all([getAdminStats(), getSystemHealth(), getUsers()]);
      setStats(s);
      setHealth(h);
      setUsers(u);
    } catch (err) {
      setError(err.message || "Could not load admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalForBar = ROLE_ORDER.reduce((sum, r) => sum + (stats?.roleCounts?.[r] || 0), 0) || 1;

  const changeRole = async (userId, role) => {
    setBusyId(userId);
    try {
      const updated = await updateUser(userId, { role });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setError(err.message || "Could not update the user's role.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleVerified = async (u) => {
    setBusyId(u.id);
    try {
      const updated = await updateUser(u.id, { verified: !u.verified });
      setUsers((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (err) {
      setError(err.message || "Could not update verification status.");
    } finally {
      setBusyId(null);
    }
  };

  const removeUser = async (u) => {
    if (!window.confirm(`Remove ${u.name}? This cannot be undone.`)) return;
    setBusyId(u.id);
    try {
      await deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err) {
      setError(err.message || "Could not remove the user.");
    } finally {
      setBusyId(null);
    }
  };

  return <AppPage>
    <div className="page-heading">
      <div><span className="section-kicker">ADMINISTRATION</span><h1>System control</h1><p>Manage access, operations and platform health.</p></div>
    </div>

    {error && <div className="page-error">{error}</div>}

    <div className="stats-grid">
      <StatCard icon={Users} label="Registered users" value={loading ? "—" : stats?.totalUsers} trend="All accounts" tone="blue"/>
      <StatCard icon={ShieldCheck} label="Verified responders" value={loading ? "—" : stats?.verifiedResponders} trend="Police & hospital" tone="green"/>
      <StatCard icon={Activity} label="System uptime" value={loading ? "—" : health ? `${Math.floor(health.uptime / 60)} min` : "—"} trend="Since last restart" tone="orange"/>
      <StatCard icon={Database} label="Events processed" value={loading ? "—" : stats?.eventsProcessed} trend="Total incidents logged" tone="red"/>
    </div>

    <div className="admin-grid">
      <div className="panel">
        <div className="panel-head"><div><h2>Access management</h2><p>Role distribution</p></div><Settings2 size={18}/></div>
        <div className="role-bar">
          {ROLE_ORDER.map((r) => (
            <span key={r} style={{ width: `${((stats?.roleCounts?.[r] || 0) / totalForBar) * 100}%`, background: ROLE_COLOR[r] }}></span>
          ))}
        </div>
        <div className="role-legend">
          {ROLE_ORDER.map((r) => (
            <span key={r}><i style={{ background: ROLE_COLOR[r] }}></i> {r.charAt(0).toUpperCase() + r.slice(1)} <b>{stats?.roleCounts?.[r] || 0}</b></span>
          ))}
        </div>
      </div>
      <div className="panel health-card">
        <div className="health-ring">{health ? "OK" : "--"}</div>
        <div><span className="section-kicker">SYSTEM HEALTH</span><h2>{health ? "Everything is operational" : "Checking system status..."}</h2><p>Maps, alerts and response services are connected.</p></div>
      </div>
    </div>

    <div className="panel table-panel" style={{ marginTop: 18 }}>
      <div className="panel-head"><div><h2>User accounts</h2><p>Manage roles and verification</p></div><span className="count-pill">{users.length} users</span></div>
      {users.map((u) => (
        <div className="unit-row" key={u.id}>
          <span className="unit-avatar">{u.name?.slice(0, 2).toUpperCase()}</span>
          <div><b>{u.name}</b><small>{u.email}</small></div>
          <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} disabled={busyId === u.id} className="role-select">
            {ROLE_ORDER.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button className={`status ${u.verified ? "" : "busy"}`} onClick={() => toggleVerified(u)} disabled={busyId === u.id} style={{ background: "none", border: 0, cursor: "pointer" }}>
            {u.verified ? "VERIFIED" : "UNVERIFIED"}
          </button>
          <button className="icon-btn" onClick={() => removeUser(u)} disabled={busyId === u.id} title="Remove user">×</button>
        </div>
      ))}
    </div>
  </AppPage>
}

function AppPage({children}){return <div className="app-shell"><Navbar app/><div className="app-body"><Sidebar/><main className="dashboard">{children}</main></div></div>}
