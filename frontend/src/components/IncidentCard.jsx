import { MapPin, Clock, ChevronRight } from "lucide-react";
import { timeAgo } from "../utils/time";

export default function IncidentCard({incident, onClick}) {
  const severity = (incident.severity || "Medium").toLowerCase();
  const location = incident.location?.address || incident.location || "Unknown location";
  const unit = incident.assignedUnit?.unitCode
    ? `Unit ${incident.assignedUnit.unitCode}`
    : incident.status || "Unassigned";

  return <div className="incident-card" onClick={onClick} role={onClick ? "button" : undefined}>
    <div className={`severity-dot ${severity}`}></div>
    <div className="incident-main">
      <div className="incident-top"><strong>{incident.title}</strong><span className={`badge ${severity}`}>{incident.severity}</span></div>
      <p><MapPin size={14}/>{location}</p>
      <small><Clock size={13}/>{timeAgo(incident.createdAt)} · {unit}</small>
    </div>
    <ChevronRight size={18} className="muted"/>
  </div>
}
