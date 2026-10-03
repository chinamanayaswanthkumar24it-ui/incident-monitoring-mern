import { useEffect, useState, useCallback } from "react";
import {
  Siren,
  Radio,
  Users,
  CheckCircle2,
  MapPin,
  Clock,
  AlertTriangle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/auth-context";
import { getUnits, updateUnit } from "../api/police";
import { getIncidents, updateIncident } from "../api/incidents";
import { getSocket } from "../api/socket";

export default function Police() {
  const { user } = useAuth();

  const [units, setUnits] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  // Critical queue state
  const [showCriticalQueue, setShowCriticalQueue] = useState(false);

  const canManage =
    user?.role === "police" || user?.role === "admin";

  const load = useCallback(async () => {
    setError("");

    try {
      const [u, i] = await Promise.all([
        getUnits(),
        getIncidents(),
      ]);

      setUnits(u);
      setIncidents(i);
    } catch (err) {
      setError(
        err.message || "Could not load police data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const socket = getSocket();

    const refresh = () => load();

    socket.on("unit:update", refresh);
    socket.on("incident:new", refresh);
    socket.on("incident:update", refresh);

    return () => {
      socket.off("unit:update", refresh);
      socket.off("incident:new", refresh);
      socket.off("incident:update", refresh);
    };
  }, [load]);

  // Normal active calls
  const activeCalls = incidents.filter(
    (i) => i.status !== "Resolved"
  );

  // Critical active calls
  const criticalCalls = activeCalls.filter(
    (i) => i.severity === "Critical"
  );

  // Reported incidents for critical queue
  const reportedIncidents = incidents.filter(
    (i) => i.status === "Reported"
  );

  const resolvedToday = incidents.filter(
    (i) => i.status === "Resolved"
  ).length;

  const officersOnline = units.reduce(
    (sum, u) => sum + (u.officerCount || 0),
    0
  );

  const availableUnits = units.filter(
    (u) => u.status === "Available"
  ).length;

  const toggleUnitStatus = async (unit) => {
    if (!canManage) return;

    setBusyId(unit._id);

    try {
      const nextStatus =
        unit.status === "Available"
          ? "Responding"
          : "Available";

      const updated = await updateUnit(
        unit._id,
        { status: nextStatus }
      );

      setUnits((prev) =>
        prev.map((u) =>
          u._id === updated._id ? updated : u
        )
      );
    } catch (err) {
      setError(
        err.message || "Could not update the unit."
      );
    } finally {
      setBusyId(null);
    }
  };

  const dispatchToTop = async () => {
    const topIncident =
      criticalCalls[0] || activeCalls[0];

    const freeUnit = units.find(
      (u) => u.status === "Available"
    );

    if (
      !topIncident ||
      !freeUnit ||
      !canManage
    ) {
      return;
    }

    setBusyId(freeUnit._id);

    try {
      await updateIncident(
        topIncident._id,
        {
          status: "Responding",
          assignedUnit: freeUnit._id,
        }
      );

      await load();
    } catch (err) {
      setError(
        err.message || "Could not dispatch a unit."
      );
    } finally {
      setBusyId(null);
    }
  };

  // Open / close reported incident queue
  const toggleCriticalQueue = () => {
    setShowCriticalQueue(
      (previous) => !previous
    );
  };

  return (
    <AppPage>

      <div className="page-heading">
        <div>
          <span className="section-kicker">
            POLICE RESPONSE
          </span>

          <h1>
            Response operations
          </h1>

          <p>
            Coordinate officers and active emergency units.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={dispatchToTop}
          disabled={!canManage}
        >
          <Radio size={17} />
          Dispatch unit
        </button>
      </div>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      <div className="stats-grid">

        <StatCard
          icon={Siren}
          label="Active calls"
          value={
            loading
              ? "—"
              : activeCalls.length
          }
          trend={`${criticalCalls.length} critical`}
          tone="red"
        />

        <StatCard
          icon={Users}
          label="Officers online"
          value={
            loading
              ? "—"
              : officersOnline
          }
          trend={`${availableUnits} units available`}
          tone="blue"
        />

        <StatCard
          icon={CheckCircle2}
          label="Resolved today"
          value={
            loading
              ? "—"
              : resolvedToday
          }
          trend="Incidents closed"
          tone="green"
        />

        <StatCard
          icon={Clock}
          label="Units tracked"
          value={
            loading
              ? "—"
              : units.length
          }
          trend="Response network"
          tone="orange"
        />

      </div>

      <div className="two-col-panels">

        {/* ACTIVE RESPONSE UNITS / REPORTED INCIDENTS */}
        <div className="panel table-panel">

          <div className="panel-head">

            <div>

              <h2>
                {showCriticalQueue
                  ? "Reported incidents"
                  : "Active response units"}
              </h2>

              <p>
                {showCriticalQueue
                  ? "Incidents waiting for police response"
                  : "Live officer status"}
              </p>

            </div>

            {showCriticalQueue && (
              <span className="count-pill">
                {reportedIncidents.length} reported
              </span>
            )}

          </div>

          {/* NORMAL UNIT VIEW */}
          {!showCriticalQueue && (
            <>
              {loading && (
                <p className="empty-note">
                  Loading units...
                </p>
              )}

              {!loading &&
                units.length === 0 && (
                  <p className="empty-note">
                    No police units yet.
                  </p>
                )}

              {!loading &&
                units.map((u) => (
                  <div
                    className="unit-row"
                    key={u._id}
                  >

                    <span className="unit-avatar">
                      {u.unitCode}
                    </span>

                    <div>
                      <b>
                        {u.unitCode} ·{" "}
                        {u.zone ||
                          "Unassigned zone"}
                      </b>

                      <small>
                        <MapPin size={12} />{" "}
                        {u.officerCount} officers ·{" "}
                        {u.status}
                      </small>
                    </div>

                    <button
                      className={`status ${
                        u.status === "Responding"
                          ? "busy"
                          : ""
                      }`}
                      onClick={() =>
                        toggleUnitStatus(u)
                      }
                      disabled={
                        !canManage ||
                        busyId === u._id
                      }
                      style={{
                        background: "none",
                        border: 0,
                        cursor: canManage
                          ? "pointer"
                          : "default",
                      }}
                    >
                      {u.status.toUpperCase()}
                    </button>

                  </div>
                ))}
            </>
          )}

          {/* REPORTED INCIDENT QUEUE */}
          {showCriticalQueue && (
            <>
              {loading && (
                <p className="empty-note">
                  Loading reported incidents...
                </p>
              )}

              {!loading &&
                reportedIncidents.length === 0 && (
                  <p className="empty-note">
                    No reported incidents currently.
                  </p>
                )}

              {!loading &&
                reportedIncidents.map(
                  (incident) => (
                    <div
                      className="unit-row"
                      key={incident._id}
                    >

                      <span className="unit-avatar">
                        <AlertTriangle size={18} />
                      </span>

                      <div>
                        <b>
                          {incident.title ||
                            "Reported incident"}
                        </b>

                        <small>
                          <MapPin size={12} />{" "}
                          {incident.location?.address ||
                            "Location unavailable"}
                        </small>

                        <small>
                          Severity:{" "}
                          {incident.severity ||
                            "Normal"}
                        </small>
                      </div>

                      <span
                        className={`status ${
                          incident.severity ===
                          "Critical"
                            ? "busy"
                            : ""
                        }`}
                      >
                        REPORTED
                      </span>

                    </div>
                  )
                )}
            </>
          )}

        </div>

        {/* PRIORITY RESPONSE */}
        <div className="panel response-note">

          <div className="big-siren">
            <Siren />
          </div>

          <h2>
            Priority response
          </h2>

          <p>
            {criticalCalls.length} critical
            incident
            {criticalCalls.length === 1
              ? ""
              : "s"} require
            {criticalCalls.length === 1
              ? "s"
              : ""} immediate coordination.
          </p>

          <button
            className="btn btn-dark"
            onClick={toggleCriticalQueue}
          >
            {showCriticalQueue
              ? "Close critical queue"
              : "Open critical queue"}
          </button>

        </div>

      </div>

    </AppPage>
  );
}

function AppPage({ children }) {
  return (
    <div className="app-shell">

      <Navbar app />

      <div className="app-body">

        <Sidebar />

        <main className="dashboard">
          {children}
        </main>

      </div>

    </div>
  );
}
