import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";

export default function MyReports() {
  const [reports, setReports] = useState([]);

  const fetchReports = () => {
    fetch("http://127.0.0.1:5000/reports")
      .then((res) => res.json())
      .then((data) => {
        const userEmail = localStorage.getItem("userEmail");

        const myReports = data.filter(
          (r) => r.email === userEmail
        );

        setReports(myReports);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ---------------- DELETE FUNCTION ----------------
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/delete-report/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Report deleted successfully");

        setReports((prev) =>
          prev.filter((r) => r.id !== id)
        );
      } else {
        alert(data.error || "Delete failed");
      }

    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  };

  return (
    <PageWrapper>

      <h1 className="text-3xl font-bold mb-6 text-center">
        My Reports
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {reports.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
          >

            {/* IMAGE */}
            <img
              src={`http://127.0.0.1:5000/uploads/${r.image}`}
              alt="report"
              className="h-48 w-full object-cover"
            />

            <div className="p-4">

              {/* DAMAGE TYPE */}
              <h2 className="font-bold text-lg mb-1">
                {r.damage_type}
              </h2>

              {/* DESCRIPTION */}
              <p className="text-sm text-gray-600 mb-2">
                {r.description}
              </p>

              {/* CITY */}
              <p className="text-sm">
                 {r.city}
              </p>

              {/* ROAD TYPE */}
              <p className="text-sm">
                 {r.road_type}
              </p>

              {/* PRIORITY */}
              <p className="text-sm mt-1">
                 Priority:{" "}
                <span
                  className={
                    r.priority === "High"
                      ? "text-red-600 font-semibold"
                      : r.priority === "Medium"
                      ? "text-yellow-500 font-semibold"
                      : "text-green-600 font-semibold"
                  }
                >
                  {r.priority}
                </span>
              </p>

              {/* STATUS */}
              <p className="text-sm mt-2">
                Status:
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs font-semibold
                    ${
                      r.status === "Completed"
                        ? "bg-green-100 text-green-600"
                        : ""
                    }
                    ${
                      r.status === "In Progress"
                        ? "bg-blue-100 text-blue-600"
                        : ""
                    }
                    ${
                      !r.status || r.status === "Pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : ""
                    }
                  `}
                >
                  {r.status || "Pending"}
                </span>
              </p>

              {/* DATE */}
              <p className="text-xs text-gray-400 mt-2">
                {r.created_at}
              </p>

              {/* DELETE BUTTON */}
              <button
                onClick={() => handleDelete(r.id)}
                className="mt-3 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
              >
                Delete Report
              </button>

            </div>
          </div>
        ))}
      </div>

    </PageWrapper>
  );
}