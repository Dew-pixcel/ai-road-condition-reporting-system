import Navbar from "../components/Navbar";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet"; //  IMPORTANT
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

//  FIX DEFAULT ICON ISSUE
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

//  CUSTOM ICONS (PRIORITY COLORS)
const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
});

const yellowIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  iconSize: [32, 32],
});

const greenIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
});

const getIcon = (priority) => {
  if (priority === "High") return redIcon;
  if (priority === "Medium") return yellowIcon;
  return greenIcon;
};

export default function Home() {
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:5000/reports")
      .then((res) => res.json())
      .then((data) => {
        console.log("Reports:", data);
        setReports(data);
      })
      .catch((err) => console.error("Error loading reports:", err));
  }, []);

  //  DYNAMIC COUNTS
  const pending = reports.filter(
    (r) => !r.status || r.status === "Pending"
  ).length;

  const completed = reports.filter(
    (r) => r.status === "Completed"
  ).length;

  const today = reports.filter((r) => {
    const todayDate = new Date().toISOString().split("T")[0];
    return r.created_at?.split(" ")[0] === todayDate;
  }).length;

  const stats = [
    { title: "Pending Reports", value: pending, icon: "⏳" },
    { title: "Completed Reports", value: completed, icon: "✅" },
    { title: "Today's Reports", value: today, icon: "🗓️" },
    { title: "Total Reports", value: reports.length, icon: "📊" },
  ];

  const chartBars = [
    {
      label: "Potholes",
      value: reports.filter((r) => r.damage_type === "pothole").length,
    },
    {
      label: "Cracks",
      value: reports.filter((r) => r.damage_type === "Crack").length,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-slate-200">
          <Navbar />

          <main className="px-5 py-8 md:px-10 md:py-10">
            {/* HEADER */}
            <section className="text-center">
              <h2 className="mx-auto max-w-3xl text-2xl font-extrabold text-sky-800 md:text-4xl">
                AI - Based Road Condition Reporting & Repair Optimization System
              </h2>
              <p className="mt-3 text-sm text-slate-500 md:text-base">
                Helping improve road safety and maintenance in Sri Lanka with AI.
              </p>
            </section>

            {/*  MAP SECTION */}
            <section className="mt-8 grid gap-6 xl:grid-cols-[1.65fr_0.85fr]">
              <div className="overflow-hidden rounded-[28px] border border-sky-200 bg-gradient-to-br from-sky-100 to-cyan-50 p-4 shadow-lg">
                <div className="relative h-[420px] rounded-[22px] overflow-hidden border-4 border-sky-500">
                  <MapContainer
                    center={[7.8731, 80.7718]}
                    zoom={7}
                    className="h-full w-full"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/*  REAL DB PINS */}
                    {reports.map((r, index) =>
                      r.latitude && r.longitude ? (
                        <Marker
                          key={index}
                          position={[
                            parseFloat(r.latitude),
                            parseFloat(r.longitude),
                          ]}
                          icon={getIcon(r.priority)} //  FIXED ICON
                        >
                          <Popup>
                            <strong>{r.damage_type}</strong> <br />
                            Priority: {r.priority} <br />
                            Status: {r.status || "Pending"} <br />
                            City: {r.city}
                          </Popup>
                        </Marker>
                      ) : null
                    )}
                  </MapContainer>

                  {/* LEGEND */}
                  <div className="absolute bottom-5 left-5 rounded-2xl bg-white/95 p-4 shadow-xl">
                    <h3 className="mb-2 text-sm font-bold">Severity</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 bg-red-500 rounded-full" /> High
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 bg-yellow-500 rounded-full" /> Medium
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 bg-green-500 rounded-full" /> Low
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="grid gap-4">
                <div className="rounded-[28px] bg-slate-900 p-6 text-white shadow-xl">
                  <h3 className="text-lg font-bold">Smart Road Monitoring</h3>
                  <p className="mt-3 text-sm text-slate-300">
                    Upload road damage images. AI detects damage, finds location,
                    and prioritizes repairs.
                  </p>

                  <button
                    onClick={() => navigate("/report")}
                    className="mt-9 rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white shadow border border-blue-700"
                  >
                    Report Road Damage
                  </button>
                </div>

                <div className="rounded-[28px] border bg-white p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-slate-800">Core AI Flow</h3>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="bg-slate-50 p-3 rounded-xl">1. Upload image</div>
                    <div className="bg-slate-50 p-3 rounded-xl">2. Detect damage</div>
                    <div className="bg-slate-50 p-3 rounded-xl">3. Get GPS</div>
                    <div className="bg-slate-50 p-3 rounded-xl">4. Prioritize</div>
                  </div>
                </div>
              </div>
            </section>

            {/*  STATS */}
            <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.title} className="bg-white p-5 rounded-xl shadow">
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              ))}
            </section>

            {/* CHART */}
            <section className="mt-8 bg-white p-6 rounded-xl shadow">
              <h3 className="text-lg font-bold mb-4">Damage Distribution</h3>

              <div className="flex items-end gap-4 h-64">
                {chartBars.map((bar) => (
                  <div key={bar.label} className="flex flex-col items-center w-full">
                    <div
                      className="bg-blue-500 w-full rounded-t"
                      style={{ height: `${bar.value * 2}px` }}
                    ></div>
                    <p className="text-sm mt-2">{bar.label}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}