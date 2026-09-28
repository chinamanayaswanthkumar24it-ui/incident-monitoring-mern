import { useState } from "react";
import { X, MapPin } from "lucide-react";
import { createIncident } from "../api/incidents";

const DEFAULT_CENTER = { lat: 16.5062, lng: 80.648 }; // Vijayawada

export default function ReportIncidentModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Accident");
  const [severity, setSeverity] = useState("Medium");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(DEFAULT_CENTER.lat);
  const [lng, setLng] = useState(DEFAULT_CENTER.lng);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => setError("Could not access your location. You can enter coordinates manually.")
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Please give the incident a short title.");
      return;
    }
    setSubmitting(true);
    try {
      const incident = await createIncident({
        title,
        description,
        category,
        severity,
        address,
        lat: Number(lat),
        lng: Number(lng),
      });
      onCreated?.(incident);
      onClose();
    } catch (err) {
      setError(err.message || "Could not report the incident. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-head">
          <h2>Report incident</h2>
          <button className="icon-btn" onClick={onClose} type="button"><X size={16}/></button>
        </div>
        <form className="modal-form" onSubmit={submit}>
          {error && <div className="form-error">{error}</div>}
          <label>Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Road accident" required />
          </label>
          <label>Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief details about what's happening" rows={3} />
          </label>
          <div className="modal-row">
            <label>Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Accident</option>
                <option>Medical</option>
                <option>Fire</option>
                <option>Crime</option>
                <option>Other</option>
              </select>
            </label>
            <label>Severity
              <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
          </div>
          <label>Location / address
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Benz Circle" />
          </label>
          <div className="modal-row">
            <label>Latitude
              <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} required />
            </label>
            <label>Longitude
              <input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)} required />
            </label>
          </div>
          <button type="button" className="text-btn small-link" onClick={useMyLocation}>
            <MapPin size={13}/> Use my current location
          </button>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Reporting..." : "Report incident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
