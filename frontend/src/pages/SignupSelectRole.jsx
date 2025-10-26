import React, { useState } from "react";
import { User, Building2, UserCheck, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

const RoleCard = ({ icon: Icon, title, description, onClick, selected }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left ${
      selected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-300"
    }`}
  >
    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${selected ? "bg-blue-500" : "bg-blue-100"}`}>
      <Icon className={selected ? "text-white" : "text-blue-500"} size={24} />
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <ArrowRight className={`flex-shrink-0 ${selected ? "text-blue-500" : "text-gray-300"}`} size={20} />
  </button>
);

export default function SignupSelectRole() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setTimeout(() => navigate(`/signup/${roleId}`), 300);
  };

  const roles = [
    { id: "manager", icon: User, title: "Manager", description: "Signup as a manager to manage the tasks and bugs" },
    { id: "developer", icon: Building2, title: "Developer", description: "Signup as a developer to assign the relevant task to QA" },
    { id: "qa", icon: UserCheck, title: "QA", description: "Signup as a QA to create the bugs and report in tasks" },
  ];

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="text-right mb-8">
        <span className="text-gray-500 text-sm">Already have an account? </span>
        <Link to="/login" className="text-blue-500 font-medium text-sm hover:underline">
          Sign In
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Join Us!</h1>
        <p className="text-gray-500">To begin this journey, tell us what type of account you'd be opening.</p>
      </div>
      <div className="space-y-4">
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            icon={role.icon}
            title={role.title}
            description={role.description}
            selected={selectedRole === role.id}
            onClick={() => handleRoleSelect(role.id)}
          />
        ))}
      </div>
    </div>
  );
}
