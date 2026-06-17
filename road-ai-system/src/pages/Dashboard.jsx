import { useEffect, useState } from "react";

export default function Dashboard() {

  const [reports, setReports] = useState([]);

  useEffect(() => {

    fetch("http://127.0.0.1:5000/reports")
      .then(res => res.json())
      .then(data => setReports(data));

  }, []);

  return (

    <div className="min-h-screen bg-slate-100 p-8">

      <h1 className="text-3xl font-bold mb-6">
        My Dashboard
      </h1>

      <div className="grid gap-6">

        {reports.map(report => (

          <div key={report.id}
          className="bg-white p-6 rounded-xl shadow">

            <p><strong>City:</strong> {report.city}</p>
            <p><strong>Phone:</strong> {report.phone}</p>
            <p><strong>Damage:</strong> {report.damage_type}</p>
            <p><strong>Severity:</strong> {report.severity}</p>
            <p><strong>Priority:</strong> {report.priority}</p>
            <p><strong>Road Type:</strong> {report.road_type}</p>

            <p>
              <strong>Location:</strong>
              {report.latitude}, {report.longitude}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}