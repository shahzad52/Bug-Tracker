import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DashboardHeader({ name, role }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Welcome, {name} ({role})
        </p>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-red-500 hover:text-red-600"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
