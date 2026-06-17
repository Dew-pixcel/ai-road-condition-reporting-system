import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";

export default function OfficerDashboard() {

  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);

  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  //  NEW STATE (MODAL)
  const [selectedReport, setSelectedReport] = useState(null);

  // FETCH
  const fetchReports = () => {
    fetch("http://127.0.0.1:5000/reports")
      .then(res => res.json())
      .then(data => {
        sortAndSet(data);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // SORT
  const sortAndSet = (data) => {
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };

    const sorted = [...data].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    setReports(sorted);
    setFilteredReports(sorted);
  };

  // FILTER
  const applyFilters = () => {
    let data = [...reports];

    if (typeFilter) {
      data = data.filter(r => r.damage_type === typeFilter);
    }

    if (cityFilter) {
      data = data.filter(r =>
        r.city.toLowerCase().includes(cityFilter.toLowerCase())
      );
    }

    setFilteredReports(data);
  };

  // UPDATE STATUS
  const updateStatus = async (r) => {
    let newStatus =
      !r.status || r.status === "Pending"
        ? "In Progress"
        : "Completed";

    await fetch(`http://127.0.0.1:5000/update-status/${r.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });

    fetchReports();
  };

  //  GOOGLE MAPS NAVIGATION
  const openMap = (lat, lon) => {
    if (!lat || !lon) {
      alert("Location not available");
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    window.open(url, "_blank");
  };

  // COUNTS
  const pending = reports.filter(r => !r.status || r.status === "Pending").length;
  const inprogress = reports.filter(r => r.status === "In Progress").length;
  const completed = reports.filter(r => r.status === "Completed").length;

  const today = reports.filter(r => {
    const todayDate = new Date().toISOString().split("T")[0];
    return r.created_at?.split(" ")[0] === todayDate;
  }).length;

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-6">

        <h1 className="text-4xl font-bold text-center mb-6 text-gray-700">
          Officer Dashboard
        </h1>

        {/* CARDS */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h2>Pending</h2>
            <p className="text-3xl text-yellow-500">{pending}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h2>In Progress</h2>
            <p className="text-3xl text-blue-500">{inprogress}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h2>Completed</h2>
            <p className="text-3xl text-green-600">{completed}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h2>Total</h2>
            <p className="text-3xl text-purple-600">{reports.length}</p>
          </div>
        </div>

        {/* FILTER */}
        <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-4">
          <select onChange={(e) => setTypeFilter(e.target.value)} className="p-2 border rounded">
            <option value="">All Types</option>
            <option value="Pothole">Pothole</option>
            <option value="Crack">Crack</option>
          </select>

          <input
            type="text"
            placeholder="City..."
            onChange={(e) => setCityFilter(e.target.value)}
            className="p-2 border rounded"
          />

          <button onClick={applyFilters} className="bg-blue-500 text-white px-4 py-2 rounded">
            Apply
          </button>
        </div>

        {/* LIST */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="space-y-3">

            {filteredReports.map((r) => (
              <div key={r.id} className="flex justify-between p-4 bg-gray-50 rounded-xl">

                <div>
                  <p className="font-semibold">{r.damage_type} - {r.city}</p>
                  <p className="text-sm text-gray-500">{r.created_at}</p>
                </div>

                <div className="flex items-center gap-3">

                  {/*  VIEW BUTTON */}
                  <button
                    onClick={() => setSelectedReport(r)}
                    className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
                  >
                    View
                  </button>

                  <span className={`px-2 py-1 rounded text-xs
                    ${r.status === "Completed" && "bg-green-100 text-green-600"}
                    ${r.status === "In Progress" && "bg-blue-100 text-blue-600"}
                    ${(!r.status || r.status === "Pending") && "bg-yellow-100 text-yellow-600"}
                  `}>
                    {r.status || "Pending"}
                  </span>

                  {r.status !== "Completed" && (
                    <button
                      onClick={() => updateStatus(r)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      {r.status === "In Progress" ? "Complete" : "Start"}
                    </button>
                  )}

                </div>
              </div>
            ))}

          </div>
        </div>

        {/*  MODAL POPUP */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">

            <div className="bg-white p-6 rounded-xl w-[400px] shadow-lg relative">

              <button
                onClick={() => setSelectedReport(null)}
                className="absolute top-2 right-2 text-red-500"
              >
                ✖
              </button>

              <h2 className="text-xl font-bold mb-3">Report Details</h2>

              <img
                src={`http://127.0.0.1:5000/uploads/${selectedReport.image}`}
                alt="damage"
                className="w-full h-48 object-cover rounded mb-3"
              />

              <p><b>Type:</b> {selectedReport.damage_type}</p>
              <p><b>City:</b> {selectedReport.city}</p>
              <p><b>Description:</b> {selectedReport.description}</p>
              <p><b>Priority:</b> {selectedReport.priority}</p>
              <p><b>Status:</b> {selectedReport.status || "Pending"}</p>

              {/*  MAP BUTTON */}
              <button
                onClick={() => openMap(selectedReport.latitude, selectedReport.longitude)}
                className="mt-4 w-full bg-green-500 text-white py-2 rounded"
              >
                View Live Location
              </button>

            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  );
}