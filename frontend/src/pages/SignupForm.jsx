import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Phone, Mail, Lock, ArrowRight } from "lucide-react";
import InputField from "../components/InputField";
import API_BASE_URL from "../api/BaseApi";

export default function SignupForm() {
  const navigate = useNavigate();
  const { role } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register/`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password2: formData.confirmPassword,
        role: role,
      });
      alert("Account created successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Registration failed.");
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Sign Up
        </h1>
        <p className="text-gray-500">Please fill your information below</p>
      </div>
      <div>
        <InputField
          icon={User}
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
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
        <InputField
          icon={Lock}
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        />
        <button
          onClick={handleSubmit}
          className="w-[45%] bg-blue-500 text-white py-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mt-6"
        >
          Sign Up
          <ArrowRight size={20} />
        </button>
        <div className="flex flex-row justify-between text-left mt-8 text-md py-4 border-t">

          <span className="text-gray-500 ">Already have an account?</span>
          <Link to="/Login" className="text-blue-500 font-medium hover:underline">
            Login to your account
          </Link>
        </div>
      </div>
    </>
  );
}
