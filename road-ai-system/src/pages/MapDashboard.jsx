import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function MapDashboard() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/reports")
      .then((res) => res.json())
      .then((data) => setReports(data));
  }, []);

  const getColor = (priority) => {
    if (priority === "High") return "red";
    if (priority === "Medium") return "orange";
    return "green";
  };

  return (
    <div className="h-screen w-full">
      <MapContainer
        center={[6.9271, 79.8612]} // Colombo
        zoom={10}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {reports.map((r) =>
          r.latitude && r.longitude ? (
            <Marker key={r.id} position={[r.latitude, r.longitude]}>
              <Popup>
                <div>
                  <p><strong>City:</strong> {r.city}</p>
                  <p><strong>Damage:</strong> {r.damage_type}</p>
                  <p><strong>Priority:</strong> {r.priority}</p>
                  <p><strong>Road:</strong> {r.road_type}</p>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}