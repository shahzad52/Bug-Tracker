import React, { useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import InputField from "../components/InputField.jsx";
import API_BASE_URL from "../api/BaseApi.jsx";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/token/`, {
        email: formData.email,
        password: formData.password,
      });

      const { access, refresh } = res.data;
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("email", formData.email);

      const decoded = JSON.parse(atob(access.split(".")[1]));
      const user = { id: decoded.user_id, email: formData.email };
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      alert("Invalid email or password.");
    }
  };


  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Login</h1>
        <p className="text-gray-500">Please enter your login details</p>

      </div>
      <div>
        <InputField
          icon={Mail}
          type="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <InputField
          icon={Lock}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          showPassword={!showPassword}
          togglePassword={togglePassword}
        />
        <button
          onClick={handleLogin}
          className="w-[40%] bg-blue-500 text-white py-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-3 mt-6"
        >
          Login
          <ArrowRight size={20} />
        </button>
        <div className="flex flex-row justify-between mt-8 text-md py-5 border-t-2">
          <span className="text-gray-500 ">Don't have an account?</span>
          <Link to="/Signup" className="text-blue-500 font-medium hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </>
  );
}
