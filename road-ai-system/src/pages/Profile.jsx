import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { Pencil } from "lucide-react";

export default function Profile() {

  const [reports, setReports] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    image: ""
  });

  const email = localStorage.getItem("userEmail");

  //  NEW: USER-SPECIFIC KEY
  const userKey = `profile_${email}`;

  // FETCH REPORTS
  useEffect(() => {
    fetch("http://127.0.0.1:5000/reports")
      .then(res => res.json())
      .then(data => setReports(data));
  }, []);

  //  LOAD USER DATA (UPDATED)
  useEffect(() => {

    const savedData = localStorage.getItem(userKey);

    if (savedData) {
      setUser(JSON.parse(savedData));
    } else {
      setUser({
        name: localStorage.getItem("userName") || "User",
        email: email || "user@email.com",
        phone: "",
        image: ""
      });

      //  CLEAR OLD GLOBAL DATA
      localStorage.removeItem("userName");
      localStorage.removeItem("userPhone");
      localStorage.removeItem("userImage");
    }

  }, [email]);

  //  SAVE PROFILE (UPDATED)
  const saveProfile = () => {

    const updatedUser = {
      ...user,
      email: email
    };

    localStorage.setItem(userKey, JSON.stringify(updatedUser));

    //  REMOVE OLD GLOBAL STORAGE
    localStorage.removeItem("userName");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("userImage");

    setEditMode(false);
  };

  // IMAGE UPLOAD
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // FILTER USER REPORTS ONLY
  const userReports = reports.filter(r => r.email === email);

  // STATUS COUNTS
  const pending = userReports.filter(
    r => !r.status || r.status === "Pending"
  ).length;

  const completed = userReports.filter(
    r => r.status === "Completed"
  ).length;

  const total = userReports.length;

  return (
    <PageWrapper>

      <div className="bg-gradient-to-b from-blue-100 to-blue-200 min-h-screen p-6">

        {/* STATS CARDS */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">

          <div className="bg-white p-5 rounded-xl shadow text-center">
            <h2 className="text-gray-500">Pending Reports</h2>
            <p className="text-3xl font-bold text-blue-600">{pending}</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow text-center">
            <h2 className="text-gray-500">Completed Reports</h2>
            <p className="text-3xl font-bold text-green-600">{completed}</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow text-center">
            <h2 className="text-gray-500">Total Reports</h2>
            <p className="text-3xl font-bold text-purple-600">{total}</p>
          </div>

        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* REPORT LIST */}
          <div className="md:col-span-2 bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-semibold mb-4">My Reports</h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">

              {userReports.map((r) => (
                <div
                  key={r.id}
                  className="flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition shadow-sm"
                >

                  <div>
                    <p className="font-semibold text-gray-700">
                      {r.damage_type} - {r.city}
                    </p>
                    <p className="text-sm text-gray-500">
                      {r.created_at}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${r.status === "Completed" && "bg-green-100 text-green-600"}
                      ${r.status === "In Progress" && "bg-blue-100 text-blue-600"}
                      ${(!r.status || r.status === "Pending") && "bg-yellow-100 text-yellow-600"}
                    `}
                  >
                    {r.status || "Pending"}
                  </span>

                </div>
              ))}

            </div>

          </div>

          {/* PROFILE */}
          <div className="bg-white rounded-xl shadow p-6 text-center">

            <div className="relative w-28 h-28 mx-auto mb-4 group">

              <img
                src={
                  user.image ||
                  "https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?semt=ais_incoming&w=740&q=80"
                }
                alt="profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-blue-200"
              />

              {editMode && (
                <>
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Pencil className="text-white" />
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </>
              )}

            </div>

            {editMode ? (
              <input
                value={user.name}
                onChange={(e) =>
                  setUser({ ...user, name: e.target.value })
                }
                className="border p-2 rounded w-full mb-2"
              />
            ) : (
              <h2 className="text-xl font-bold">{user.name}</h2>
            )}

            <p className="text-gray-500">{user.email}</p>

            {editMode ? (
              <input
                value={user.phone}
                onChange={(e) =>
                  setUser({ ...user, phone: e.target.value })
                }
                className="border p-2 rounded w-full mt-2"
              />
            ) : (
              <p className="text-gray-600 mt-2">
                {user.phone || "No phone added"}
              </p>
            )}

            {editMode ? (
              <button
                onClick={saveProfile}
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg w-full"
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
              >
                Edit Profile
              </button>
            )}

          </div>

        </div>

      </div>

    </PageWrapper>
  );
}