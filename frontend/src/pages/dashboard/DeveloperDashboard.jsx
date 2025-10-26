import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import ProjectCard from "../../components/ProjectCard";
import API_BASE_URL from "../../api/BaseApi";


export default function DeveloperDashboard({ user }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem("access");
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/projects/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(response.data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visnext Software Solutions</h1>
          <p className="text-gray-600 mt-1">Hi {user.name}, welcome to ManageBug</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for Projects here"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>

      {loading ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 space-y-4 animate-pulse">
              <div className="w-12 h-12 rounded-lg bg-gray-200"></div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project}
              onClick={() => navigate(`/projects/${project.id}`, { state: { role: 'developer' } })}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed">
          <h3 className="text-lg font-semibold text-gray-800">No Projects Assigned</h3>
          <p className="text-gray-500 mt-1">You have not been assigned to any projects yet.</p>
        </div>
      )}
    </div>
  );
}


