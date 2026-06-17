import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Report from "./pages/Report";
import MyReports from "./pages/MyReports";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OfficerDashboard from "./pages/OfficerDashboard";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/report" element={<Report />} />
      <Route path="/my-reports" element={<MyReports />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/officer" element={<OfficerDashboard />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;