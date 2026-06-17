import PageWrapper from "../components/PageWrapper";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    const res = await fetch("http://127.0.0.1:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.message) {
      alert("Registered Successfully");
      window.location.href = "/login";
    } else {
      alert("User already exists");
    }
  };

  return (
    <PageWrapper>
      <div className="flex items-center justify-center h-[620px] bg-gradient-to-b from-blue-100 to-blue-200 px-3">
        <div className="bg-white p-12 rounded-2xl shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-700">Register</h1>
          <p className="text-gray-550 text-center mb-6">Create a new account to get started</p>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex items-center border rounded-lg px-4 py-3 bg-gray-50">
              <Mail className="text-gray-400 mr-3" size={22} />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent outline-none text-sm"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex items-center border rounded-lg px-4 py-3 bg-gray-50">
              <Lock className="text-gray-400 mr-3" size={22} />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full bg-transparent outline-none text-sm"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center border rounded-lg px-4 py-3 bg-gray-50">
              <Lock className="text-gray-400 mr-3" size={22} />
              <input
                type="password"
                placeholder="Confirm your password"
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>

            <div className="flex justify-center text-xs mt-2">
              <p className="text-gray-700 text-sm m-0">
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 hover:underline cursor-pointer">
                  Login
                </a>
              </p>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg hover:opacity-90 transition font-semibold text-base mt-2"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}