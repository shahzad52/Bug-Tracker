import React from "react";
import { Eye, EyeOff } from "lucide-react";

export default function InputField({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  showPassword,
  togglePassword,
}) {
  return (
    <div className="relative mb-4">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        <Icon size={20} />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-12 pr-12 py-4 bg-gray-100 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
      />
      {togglePassword && (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
}
