
import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

// Default map location, shown only when there are no incidents.
const DEFAULT_CENTER = [16.5062, 80.648];

// Alert color based on incident severity.
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

// Create a warning-symbol marker.
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

// Automatically move the map to the latest reported incident.
function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, Math.max(map.getZoom(), 14), {
        animate: true,
        duration: 1.2,
      });
    }
  }, [map, position]);

  return null;
}

export default function LiveMap({ incidents = [] }) {
  // Keep incidents with valid latitude and longitude.
  const points = incidents
    .filter((incident) => {
      const lat = incident.location?.lat;
      const lng = incident.location?.lng;

      return (
        lat !== undefined &&
        lat !== null &&
        lat !== "" &&
        lng !== undefined &&
        lng !== null &&
        lng !== "" &&
        Number.isFinite(Number(lat)) &&
        Number.isFinite(Number(lng)) &&
        Number(lat) >= -90 &&
        Number(lat) <= 90 &&
        Number(lng) >= -180 &&
        Number(lng) <= 180
      );
    })
    .map((incident) => ({
      id: incident._id || incident.id,
      pos: [
        Number(incident.location.lat),
        Number(incident.location.lng),
      ],
      title: incident.title || "Reported incident",
      place:
        incident.location?.address ||
        incident.address ||
        "Location provided",
      severity: incident.severity || "Medium",
      status: incident.status || "Reported",
      category: incident.category || "Other",
    }));

  // Assumes the first incident is the newest.
  const latestPosition = points.length > 0 ? points[0].pos : null;

  return (
    <div className="map-wrap">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%", minHeight: "360px" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater position={latestPosition} />

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
                <p>
                  <b>Coordinates:</b>{" "}
                  {incident.pos[0].toFixed(6)},{" "}
                  {incident.pos[1].toFixed(6)}
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
