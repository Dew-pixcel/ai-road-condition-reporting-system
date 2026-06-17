import PageWrapper from "../components/PageWrapper";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.role === "officer") {
      localStorage.setItem("userEmail", email);
      // Store email and role for Navbar
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", "officer");
      window.location.href = "/officer";
    } else if (data.role === "user") {
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", "user");
      localStorage.setItem("userEmail", email);
      window.location.href = "/my-reports";
    } else {
      alert("Invalid login");
    }
  };

  return (
    <PageWrapper>
      <div className="flex items-center justify-center h-[620px] bg-gradient-to-b from-blue-100 to-blue-200 px-3">
        <div className="bg-white p-12 rounded-2xl shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-700">
            Login
          </h1>
          <p className="text-gray-550 text-center mb-6">Sign in to your account</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex items-center border rounded-lg px-4 py-3 bg-gray-50">
              <Mail className="text-gray-400 mr-3" size={22} />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent outline-none text-sm"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="flex items-center border rounded-lg px-4 py-3 bg-gray-50">
              <Lock className="text-gray-400 mr-3" size={22} />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full bg-transparent outline-none text-sm"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Extra Links */}
            <div className="flex justify-between text-xs items-center">
              <span className="text-blue-600 cursor-pointer hover:underline">
                Forgot Password?
              </span>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg hover:opacity-90 transition font-semibold text-base"
            >
              Login
            </button>

            <p className="text-gray-700 text-sm m-0">
              You don't have an account?{" "}
              <a href="/register" className="text-blue-600 hover:underline cursor-pointer">
                Register
              </a>
            </p>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}