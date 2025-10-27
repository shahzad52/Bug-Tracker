import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../api/BaseApi";

export default function AddMemberModal({ project, onClose }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const token = localStorage.getItem("access");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filtered = res.data.filter(
          (u) => u.role === "qa" || u.role === "developer"
        );
        setUsers(filtered);
      } catch {
        alert("Failed to load users. Please refresh and try again.");
      }
    };
    fetchUsers();
  }, [token]);

  const handleAddMember = async () => {
    if (!selectedUser) {
      alert("Please select a user to add.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API_BASE_URL}/api/project-users/`,
        { project: project.id, user: selectedUser },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Member added successfully.");
      onClose();
    } catch (err) {
      if (err.response?.data?.error === "user already member") {
        alert("This user is already part of the project.");
      } else {
        alert("Unable to add member. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
        <h3 className="text-lg font-semibold mb-5">
          Add Member to {project.name}
        </h3>
        <select
          className="border rounded-lg w-full p-3 mb-4"
          onChange={(e) => setSelectedUser(e.target.value)}
          value={selectedUser}
        >
          <option value="">Select a user</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role})
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleAddMember}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white ${
              loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Adding..." : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}
