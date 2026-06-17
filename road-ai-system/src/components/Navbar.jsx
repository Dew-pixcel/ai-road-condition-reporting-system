import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [userEmail, setUserEmail] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");
    if (email) setUserEmail(email);
    if (role) setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    setUserEmail(null);
    setUserRole(null);
    navigate("/login");
  };

  return (
    <div className="w-full flex justify-center mt-6 relative">
      <nav className="flex items-center px-6 py-3 bg-black rounded-full shadow-lg w-full max-w-4xl">
        {/* Left Icon */}
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <span className="text-black text-sm">🚗</span>
        </div>

        {/* Middle Buttons */}
        <div className="flex-1 flex justify-center items-center gap-3 text-sm font-medium">
          <Link
            to="/"
            className="text-white hover:text-black hover:bg-white px-4 py-1.5 rounded-full transition duration-200"
          >
            Home
          </Link>

          {/* Guest */}
          {!userEmail && (
            <>
              <Link
                to="/login"
                className="text-white hover:text-black hover:bg-white px-4 py-1.5 rounded-full transition duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-white hover:text-black hover:bg-white px-4 py-1.5 rounded-full transition duration-200"
              >
                Register
              </Link>
            </>
          )}

          {/* Normal user */}
          {userEmail && userRole === "user" && (
            <>
              <Link
                to="/my-reports"
                className="text-white hover:text-black hover:bg-white px-4 py-1.5 rounded-full transition duration-200"
              >
                My Reports
              </Link>
              <Link
                to="/profile"
                className="text-white hover:text-black hover:bg-white px-4 py-1.5 rounded-full transition duration-200"
              >
                Profile
              </Link>
            </>
          )}

          {/* Officer/admin */}
          {userEmail && userRole === "officer" && (
            <>
              <Link
                to="/officer"
                className="text-white hover:text-black hover:bg-white px-4 py-1.5 rounded-full transition duration-200"
              >
                Dashboard
              </Link>
           
            </>
          )}
        </div>

        {/* Right User Circle */}
        {userEmail && (
          <div className="flex items-center gap-3 relative ml-4">
            <div
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="text-black font-semibold">
                {userEmail[0].toUpperCase()}
              </span>
            </div>

            {/* Side Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-lg py-2 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Logout
                </button>
                <button
                  onClick={() => alert("Help Section")}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Help
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}