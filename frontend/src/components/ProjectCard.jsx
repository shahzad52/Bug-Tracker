import React, { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../api/BaseApi';


const getIconForProject = () => {
    return <Briefcase className="text-gray-500" />;
};

export default function ProjectCard({ project, onClick }) {
    const [bugs, setBugs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBugs = async () => {
            setLoading(true);
            const token = localStorage.getItem("access");
            try {
                const response = await axios.get(`${API_BASE_URL}/api/bugs/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                const projectBugs = response.data.filter(bug => bug.project === project.id);
                setBugs(projectBugs);
            } catch (error) {
                console.error("Failed to fetch bugs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBugs();
    }, [project.id]);

    return (
        <div 
            onClick={onClick} 
            className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
        >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#d1eaf6] mb-3">
                {project.logo_url || project.logo ? (
                    <img 
                        src={`${API_BASE_URL}${project.logo_url || `/media/${project.logo}`}`} 
                        alt={`${project.name} logo`} 
                        className="w-full h-full object-cover rounded-lg" 
                    />
                ) : (
                   getIconForProject(project.name)
                )}
            </div>
            <h3 className="text-[15px] font-semibold text-gray-900 truncate group-hover:text-blue-600">{project.name}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">{project.detail || 'Redesign all the web pages with animation.'}</p>
            <div className="mt-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                        Tasks Done: {bugs.filter(bug => bug.status.toLowerCase() === 'resolved').length}/{bugs.length}
                    </span>
                    
                </div>
            </div>
        </div>
    );
}

