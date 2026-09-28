import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

const DEFAULT_CENTER = [16.5062, 80.648]; // Vijayawada

const severityColor = (severity) =>
  severity === "Critical" ? "#ef4444" : severity === "High" ? "#f97316" : severity === "Medium" ? "#eab308" : "#16a34a";

export default function LiveMap({ incidents = [] }) {
  const points = incidents
    .filter((i) => i.location?.lat && i.location?.lng)
    .map((i) => ({
      id: i._id || i.id,
      pos: [i.location.lat, i.location.lng],
      title: i.title,
      place: i.location.address,
      severity: i.severity,
    }));

  const center = points[0]?.pos || DEFAULT_CENTER;

  return <div className="map-wrap">
     <MapContainer center={center} zoom={12} scrollWheelZoom>
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
      {points.map(i=><CircleMarker key={i.id} center={i.pos} radius={10} pathOptions={{color:severityColor(i.severity),fillOpacity:.85}}>
        <Popup><b>{i.title}</b><br/>{i.place}<br/><strong>{i.severity}</strong></Popup>
      </CircleMarker>)}
     </MapContainer>
     <div className="map-legend"><b>Live incidents</b><span><i className="legend critical"></i> Critical</span><span><i className="legend high"></i> High</span><span><i className="legend medium"></i> Medium</span></div>
   </div>
}
