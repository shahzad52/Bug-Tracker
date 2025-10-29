import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, List, Plus } from 'lucide-react';
import axios from 'axios';
import BugsGrid from '../../components/bugs/BugsGrid';
import BugsTable from '../../components/bugs/BugsTable';
import BugDetailsModal from '../../components/bugs/BugDetailsModal';
import AddNewBugModal from '../../components/bugs/AddNewBugModal';
import AddMemberModal from './AddMemberModal';
import API_BASE_URL from '../../api/BaseApi';


export default function ProjectPage() {
  const navigate = useNavigate(); 
  const { projectId } = useParams();
  const { state } = useLocation();
  const [project, setProject] = useState(null);
  const [bugs, setBugs] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (state?.role) {
      localStorage.setItem('userRole', state.role);
    }
  }, [state?.role]);
  
  const userRole = state?.role || localStorage.getItem('userRole');
  
  
  useEffect(() => {
    if (!userRole) {
      navigate('/dashboard');
    }
  }, [userRole, navigate]);
  const [selectedBug, setSelectedBug] = useState(null);
  const [isAddBugModalOpen, setIsAddBugModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access');
      setIsLoading(true);
      console.log('Fetching data for project ID:', projectId);
      try {

        const userRes = await axios.get(`${API_BASE_URL}/api/auth/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        const [projectRes, bugsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/projects/${projectId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/bugs/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        
        setProject(projectRes.data);
        
        let projectBugs = bugsRes.data.filter(bug => {
          return bug.project === parseInt(projectId);
        });
      
        if (userRole === 'developer' && userRes.data?.id) {
          projectBugs = projectBugs.filter(bug => {
            const assigneeId = typeof bug.assignee === 'object' ? bug.assignee?.id : bug.assignee;
            return assigneeId === userRes.data.id;
          });
        } else if (userRole === 'qa' && userRes.data?.id) {
          console.log('QA filtering - Current user ID:', userRes.data.id);
          projectBugs = projectBugs.filter(bug => {
            console.log('Checking bug:', bug.id, 'creator:', bug.creator);
  
            const creatorId = typeof bug.creator === 'object' ? bug.creator?.id : bug.creator;
            return creatorId === userRes.data.id;
          });
          
        } else if (userRole === 'manager') {
  
          console.log('Manager view - showing all project bugs');
        }
        
        console.log('Filtered bugs for role', userRole, ':', projectBugs);
        
        console.log('Filtered Bugs:', projectBugs);
        setBugs(projectBugs);
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId, navigate, userRole]);

  const filteredBugs = bugs.filter(bug =>
    bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bug.description && bug.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  console.log('Final filtered bugs:', filteredBugs);

  const handleBugClick = (bugId) => {
    const bug = bugs.find(b => b.id === bugId);
    if (bug) {
      setSelectedBug(bug);
    }
  };

  const handleBugAdded = () => {
    const fetchBugs = async () => {
      const token = localStorage.getItem('access');
      try {
        console.log('Refreshing bugs with role:', userRole); 
        const userRes = await axios.get(`${API_BASE_URL}/api/auth/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Current user:', userRes.data);
        
        const response = await axios.get(`${API_BASE_URL}/api/bugs/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('All fetched bugs:', response.data);
        let projectBugs = response.data.filter(bug => bug.project === parseInt(projectId));
        console.log('Project filtered bugs:', projectBugs);
        
        if (userRole === 'developer' && userRes.data?.id) {
          projectBugs = projectBugs.filter(bug => {
            const assigneeId = typeof bug.assignee === 'object' ? bug.assignee?.id : bug.assignee;
            return assigneeId === userRes.data.id;
          });
        } else if (userRole === 'qa' && userRes.data?.id) {
          console.log('QA filtering - Current user ID:', userRes.data.id);
          projectBugs = projectBugs.filter(bug => {
            console.log('Checking bug:', bug.id, 'creator:', bug.creator);
            const creatorId = typeof bug.creator === 'object' ? bug.creator?.id : bug.creator;
            return creatorId === userRes.data.id;
          });
          console.log('Bugs after QA filtering:', projectBugs);
        } else if (userRole === 'manager') {
          
          console.log('Manager view - showing all project bugs after refresh');
        }
        
        console.log('Bugs after role filtering:', projectBugs);
        
        setBugs(projectBugs);
      } catch (error) {
        console.error('Error fetching bugs:', error);
      }
    };
    fetchBugs();
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading project details...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project?.name}</h1>
          <p className="text-gray-600 mt-1">
            {userRole === 'developer' 
              ? 'Bugs assigned to you in this project'
              : userRole === 'qa'
                ? 'Bugs created by you in this project'
                : 'All bugs in this project'}
          </p>
        </div>
        <div className="flex w-full sm:w-auto items-center gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search bugs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2.5 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1 bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <List size={20} />
            </button>
          </div>
          {userRole === 'manager' ? (
            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="flex-shrink-0 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus size={20} />
              Add Member
            </button>
          ) : userRole === 'qa' ? (
            <button
              onClick={() => setIsAddBugModalOpen(true)}
              className="flex-shrink-0 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus size={20} />
              Add New Bug
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        {bugs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed">
            <h3 className="text-lg font-semibold text-gray-800">No Bugs Found</h3>
            <p className="text-gray-500 mt-1">Get started by creating your first bug report.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <BugsGrid bugs={filteredBugs} onBugClick={handleBugClick} />
        ) : (
          <BugsTable bugs={filteredBugs} onBugClick={handleBugClick} />
        )}
      </div>

      {selectedBug && (
        <BugDetailsModal
          bugId={selectedBug.id}
          onClose={() => setSelectedBug(null)}
          onBugUpdated={handleBugAdded}
          isDeveloper={userRole === 'developer'}
        />
      )}

      {isAddBugModalOpen && (
        <AddNewBugModal
          projectId={parseInt(projectId)}
          onClose={() => setIsAddBugModalOpen(false)}
          onBugAdded={handleBugAdded}
        />
      )}
      {isAddMemberModalOpen && (
        <AddMemberModal
          project={project}
          onClose={() => setIsAddMemberModalOpen(false)}
        />
      )}
    </div>
  );
}
