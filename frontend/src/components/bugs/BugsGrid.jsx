import React, { useState } from 'react';
import { Calendar, MoreVertical } from 'lucide-react';
import BugDetailsModal from './BugDetailsModal';

const StatusPill = ({ status }) => {
    const base = "px-2 py-0.5 text-xs font-medium rounded-full inline-block capitalize";
    const styles = {
        started: "bg-yellow-100 text-yellow-800",
        resolved: "bg-green-100 text-green-800",
        new: "bg-blue-300 text-gray-800"
    };
    return <span className={`${base} ${styles[status.toLowerCase()] || styles.new}`}>{status}</span>;
};



const BugCard = ({ bug, onClick }) => (
    <div onClick={onClick} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all cursor-pointer">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{bug.title}</h3>
            <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={18} />
            </button>
        </div>

        <div className="space-y-4">
            <StatusPill status={bug.status} />
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <span className="text-gray-600">Due Date</span>
                    <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{bug.deadline ? new Date(bug.deadline).toLocaleDateString() : 'Not set'}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Assigned To</span>
                <div className="flex items-center gap-2">
                    {typeof bug.assignee === 'object' && bug.assignee ? (
                        <div className="relative group">
                            <div className="h-6 w-6 rounded-full overflow-hidden">
                                {bug.assignee.profile_picture_url ? (
                                    <img 
                                        src={bug.assignee.profile_picture_url} 
                                        alt={bug.assignee.name || 'User'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                                        {bug.assignee.name ? bug.assignee.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {bug.assignee.name || 'Unknown User'}
                            </div>
                        </div>
                    ) : (
                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                            U
                        </div>
                    )}
                    <span className="text-sm text-gray-900">{bug.assignee?.name || 'Unassigned'}</span>
                </div>
            </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                View Details
            </button>
        </div>
    </div>
);

export default function BugGrid({ bugs }) {
  const [selectedBugId, setSelectedBugId] = useState(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {bugs.map((bug) => (
              <BugCard key={bug.id} bug={bug} onClick={() => setSelectedBugId(bug.id)} />
          ))}
      </div>
      {selectedBugId && (
        <BugDetailsModal
            bugId={selectedBugId}
            onClose={() => setSelectedBugId(null)}
        />
      )}
    </>
  );
}

