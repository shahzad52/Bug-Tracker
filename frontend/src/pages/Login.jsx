import React, { useState } from "react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import {Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../components/AuthLayout.jsx";
import InputField from "../components/InputField.jsx";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
  try {
    const res = await axios.post("http://127.0.0.1:8000/api/auth/token/", {
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
        <div className="text-right mb-8">
          <span className="text-gray-500 text-sm">Do not have an account? </span>
          <Link to="/Signup" className="text-blue-500 font-medium text-sm hover:underline">
            Sign up
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Login</h1>
        <p className="text-gray-500">Enter your credentials below</p>
        
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
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mt-6"
        >
          Login
          <ArrowRight size={20} />
        </button>
      </div>
    </>
  );
}
