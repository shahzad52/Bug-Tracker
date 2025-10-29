import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import ProjectCard from "../../components/ProjectCard";
import AddNewProjectModal from "../../components/AddNewProjectModal";
import BugDetailsModal from "../../components/bugs/BugDetailsModal";
import AddMemberModal from "./AddMemberModal";
import API_BASE_URL from "../../api/BaseApi";

export default function ManagerDashboard({ user }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bugModalOpen, setBugModalOpen] = useState(false);
  const [selectedBugId, setSelectedBugId] = useState(null);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    const token = localStorage.getItem("access");
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/projects/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const myProjects = response.data.filter((p) => p.manager === user.id);
      setProjects(myProjects);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (user?.id) fetchProjects();
  }, [user, fetchProjects]);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProjectClick = (project) => {

    localStorage.setItem('userRole', 'manager');
    navigate(`/projects/${project.id}`, { state: { role: 'manager' } });
  }; const handleAddMember = (project) => {
    setSelectedProject(project);
    setMemberModalOpen(true);
  };
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading projects...</div>
      </div>
    );
  }
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Visnext Software Solutions</h1>
          <p className="text-gray-600 mt-1">Hi {user.name}, welcome to ManageBug</p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-4">
          <div className="relative w-full flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for Projects here"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-shrink-0 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus size={20} />
            Add New Project
          </button>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-20">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-lg bg-[#E6F7FF]"></div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-100 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
              <div className="h-1 bg-gray-100 rounded-full w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div key={project.id}>
              <ProjectCard
                project={project}
                onClick={() => handleProjectClick(project)}
              />
            </div>
          ))}


        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed">
          <h3 className="text-lg font-semibold text-gray-800">No Projects Found</h3>
          <p className="text-gray-500 mt-1">Get started by creating your first project.</p>
        </div>
      )}

      {isModalOpen && <AddNewProjectModal user={user} onClose={() => setIsModalOpen(false)} onProjectAdded={fetchProjects} />}
      {bugModalOpen && selectedBugId && (
        <BugDetailsModal bugId={selectedBugId} onClose={() => setBugModalOpen(false)} />
      )}
      {memberModalOpen && selectedProject && (
        <AddMemberModal project={selectedProject} onClose={() => setMemberModalOpen(false)} />
      )}
    </div>
  );
}

