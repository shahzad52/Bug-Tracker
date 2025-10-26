import React, { useState } from 'react';
import { Calendar, MoreVertical, LayoutGrid, List } from 'lucide-react';
import axios from 'axios';
import BugDetailsModal from './BugDetailsModal';
import BugsGrid from './BugsGrid.jsx';
import API_BASE_URL from '../../api/BaseApi.jsx';


const StatusPill = ({ status }) => {
  const base = "px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block capitalize";
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    "in progress": "bg-blue-100 text-blue-800",
    closed: "bg-green-100 text-green-800",
    new: "bg-gray-100 text-gray-800"
  };
  return <span className={`${base} ${styles[status.toLowerCase()] || styles.new}`}>{status}</span>;
};

const PriorityIndicator = ({ type }) => {
    const color = type.toLowerCase() === 'bug' ? 'bg-red-500' : 'bg-blue-500';
    return <span className={`flex-shrink-0 w-2 h-2 ${color} rounded-full`}></span>;
}

const UserAvatarStack = ({ assignee }) => (
  <div className="flex items-center -space-x-2">
    {typeof assignee === 'object' && assignee ? (
      <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-white">
        {assignee.profile_picture_url ? (
          <img 
            src={assignee.profile_picture_url} 
            alt={assignee.name || 'User'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-black text-white flex items-center justify-center text-sm font-bold">
            {assignee.name ? assignee.name.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
      </div>
    ) : (
      <div className="h-8 w-8 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-sm text-gray-500">
        U
      </div>
    )}
  </div>
);

export default function BugTable({ bugs, onBugsUpdated }) {
  const [selectedBugId, setSelectedBugId] = useState(null);
  const [viewMode, setViewMode] = useState('table'); 
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleRowClick = (bugId) => {
    setSelectedBugId(bugId);
  };

  const handleStatusChange = async (bugId, newStatus) => {
    if (localStorage.getItem('role') !== 'developer') {
      return; 
    }
    
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('access');
      await axios.patch(
        `${API_BASE_URL}/api/bugs/${bugId}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      const updatedBugs = bugs.map(bug => 
        bug.id === bugId ? { ...bug, status: newStatus } : bug
      );
      onBugsUpdated(updatedBugs);
    } catch (error) {
      console.error('Failed to update bug status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {viewMode === 'table' ? (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bug Details</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bugs.map((bug) => (
              <tr key={bug.id} onClick={() => handleRowClick(bug.id)} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                      <PriorityIndicator type={bug.type} />
                      <span className="text-sm font-medium text-gray-900">{bug.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusPill status={bug.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{bug.deadline ? new Date(bug.deadline).toLocaleDateString() : 'Not set'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <UserAvatarStack assignee={bug.assignee} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ) : (
        <BugsGrid bugs={bugs} onBugClick={handleRowClick} />
      )}

      {selectedBugId && (
        <BugDetailsModal
            bugId={selectedBugId}
            onClose={() => setSelectedBugId(null)}
            onStatusChange={handleStatusChange}
            isUpdating={isUpdating}
            isDeveloper={localStorage.getItem('role') === 'developer'}
        />
      )}
    </>
  );
}

