
import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

const DEFAULT_CENTER = [16.5062, 80.648]; // Vijayawada

// Give each severity a different alert color.
const severityColor = (severity) => {
  switch (severity) {
    case "Critical":
      return "#dc2626";
    case "High":
      return "#f97316";
    case "Medium":
      return "#eab308";
    default:
      return "#16a34a";
  }
};

// Create a warning-symbol marker for the map.
const createAlertIcon = (severity) => {
  const color = severityColor(severity);

  return L.divIcon({
    className: "incident-marker-wrapper",
    html: `
      <div class="incident-alert-marker"
           style="--alert-color: ${color}">
        <span>!</span>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -38],
  });
};

// Move the map to the newest incident when it is reported.
function MapUpdater({ latestPosition }) {
  const map = useMap();

  useEffect(() => {
    if (latestPosition) {
      map.setView(latestPosition, Math.max(map.getZoom(), 13), {
        animate: true,
      });
    }
  }, [latestPosition, map]);

  return null;
}

export default function LiveMap({ incidents = [] }) {
  // Keep only incidents with valid GPS coordinates.
  const points = incidents
    .filter((incident) => {
      const lat = Number(incident.location?.lat);
      const lng = Number(incident.location?.lng);

      return (
        incident.location?.lat !== undefined &&
        incident.location?.lat !== null &&
        incident.location?.lng !== undefined &&
        incident.location?.lng !== null &&
        incident.location?.lat !== "" &&
        incident.location?.lng !== "" &&
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      );
    })
    .map((incident) => ({
      id: incident._id || incident.id,
      pos: [
        Number(incident.location.lat),
        Number(incident.location.lng),
      ],
      title: incident.title || "Reported incident",
      place: incident.location.address || "Location provided",
      severity: incident.severity || "Medium",
      status: incident.status || "Reported",
      category: incident.category || "Other",
    }));

  const latestPosition = points[0]?.pos || null;

  return (
    <div className="map-wrap">
      <MapContainer
        center={latestPosition || DEFAULT_CENTER}
        zoom={12}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater latestPosition={latestPosition} />

        {points.map((incident) => (
          <Marker
            key={incident.id}
            position={incident.pos}
            icon={createAlertIcon(incident.severity)}
          >
            <Popup>
              <div className="incident-popup">
                <strong>⚠ {incident.title}</strong>
                <p>
                  <b>Location:</b> {incident.place}
                </p>
                <p>
                  <b>Category:</b> {incident.category}
                </p>
                <p>
                  <b>Severity:</b> {incident.severity}
                </p>
                <p>
                  <b>Status:</b> {incident.status}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="map-legend">
        <b>Incident Alerts</b>
        <span>
          <i className="legend critical" /> Critical
        </span>
        <span>
          <i className="legend high" /> High
        </span>
        <span>
          <i className="legend medium" /> Medium
        </span>
      </div>
    </div>
  );
}
