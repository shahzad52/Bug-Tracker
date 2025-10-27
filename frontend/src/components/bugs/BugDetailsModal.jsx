import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ChevronDown, Image } from 'lucide-react';
import API_BASE_URL from '../../api/BaseApi';


const StatusBadge = ({ bugId, status, type, onStatusChange, isDeveloper }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [updating, setUpdating] = useState(false);
    
    
    const styles = {
      'started': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'resolved': 'bg-green-100 text-green-800',
      'new': 'bg-gray-100 text-gray-800'
    };

    const statusOptionsByType = {
        'feature': ['new', 'started', 'completed'],
        'bug': ['new', 'started', 'resolved']
    };

    const statusOptions = statusOptionsByType[type] || [];

    const handleStatusChange = async (newStatus) => {
        if (!isDeveloper) return;
        
        setUpdating(true);
        try {
            const token = localStorage.getItem('access');
            await axios.patch(
                `${API_BASE_URL}/api/bugs/${bugId}/`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            onStatusChange && onStatusChange(newStatus);
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdating(false);
            setShowDropdown(false);
        }
    };

    return (
        <div className="relative inline-block">
            <button 
                type="button"
                onClick={() => isDeveloper && !updating && setShowDropdown(!showDropdown)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${styles[status.toLowerCase()] || styles.new} 
                    ${isDeveloper ? 'cursor-pointer hover:ring-2 hover:ring-gray-200' : ''}
                    ${updating ? 'opacity-75' : ''}`}
            >
                <span className="text-sm font-medium capitalize">{status}</span>
                {isDeveloper && (
                    updating ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <ChevronDown 
                            size={16} 
                            className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} 
                        />
                    )
                )}
            </button>
            
            {showDropdown && isDeveloper && (
                <div className="absolute left-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {statusOptions.map(option => (
                            <button
                                key={option}
                                onClick={() => handleStatusChange(option)}
                                className={`block w-full px-4 py-2 text-sm text-left capitalize
                                    ${status === option ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                                role="menuitem"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const UserAvatar = ({ user }) => (
    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
        {typeof user === 'object' && user?.profile_picture_url ? (
            <img 
                src={user.profile_picture_url} 
                alt={user?.name || 'User'}
                className="w-full h-full object-cover"
            />
        ) : (
            <div className="w-full h-full bg-black text-white flex items-center justify-center text-sm font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
        )}
    </div>
);

export default function BugDetailsModal({ bugId, onClose, onStatusChange, onBugUpdated }) {
    const [bug, setBug] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editedDetail, setEditedDetail] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUserAndBugDetails = async () => {
            if (!bugId) return;
            
            const token = localStorage.getItem('access');
            setLoading(true);
            
            try {
                
                const userResponse = await axios.get(`${API_BASE_URL}/api/auth/me/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Current user details:', userResponse.data);
                setUserRole(userResponse.data.role);
                
               
                const bugResponse = await axios.get(`${API_BASE_URL}/api/bugs/${bugId}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Bug details fetched:', bugResponse.data);
                setBug(bugResponse.data);
                setEditedDetail(bugResponse.data.detail || '');
                
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserAndBugDetails();
    }, [bugId]);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        try {
            setSaving(true);
            const token = localStorage.getItem('access');
            
            const formData = new FormData();
            formData.append('file', file);
            
            const uploadResponse = await axios.post(
                `${API_BASE_URL}/api/upload/`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            
            const response = await axios.patch(
                `${API_BASE_URL}/api/bugs/${bugId}/`,
                {
                    bug_attachment: { path: uploadResponse.data.path }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            
            setBug(response.data);
            if (response.data.bug_attachment?.path) {
                setSelectedImage(response.data.bug_attachment.path);
            }
            
            onBugUpdated && onBugUpdated();
            
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDetailUpdate = async () => {
        if (!editMode || bug.detail === editedDetail) {
            setEditMode(false);
            return;
        }

        try {
            setSaving(true);
            const token = localStorage.getItem('access');
            await axios.patch(
                `${API_BASE_URL}/api/bugs/${bugId}/`,
                { detail: editedDetail },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            setBug({ ...bug, detail: editedDetail });
            setEditMode(false);
        } catch (error) {
            console.error('Failed to update details:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading || !bug) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl animate-slide-up">
                <header className="flex justify-between items-start p-5 border-b gap-4">
                   <div className="flex items-center flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            
                            {bug.assignee && (
                                <div className="relative group">
                                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white">
                                        {bug.assignee.profile_picture_url ? (
                                            <img 
                                                src={bug.assignee.profile_picture_url} 
                                                alt={bug.assignee.name || 'Assignee'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                                                {bug.assignee.name ? bug.assignee.name.charAt(0).toUpperCase() : 'A'}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                        {`Developer: ${bug.assignee.name || 'Unknown'}`}
                                    </div>
                                </div>
                            )}
                            
            
                            {bug.creator && (
                                <div className="relative group">
                                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white">
                                        {bug.creator.profile_picture_url ? (
                                            <img 
                                                src={bug.creator.profile_picture_url} 
                                                alt={bug.creator.name || 'Creator'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-purple-600 text-white flex items-center justify-center text-lg font-bold">
                                                {bug.creator.name ? bug.creator.name.charAt(0).toUpperCase() : 'Q'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                        {`QA: ${bug.creator.name || 'Unknown'}`}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <StatusBadge 
                            bugId={bugId}
                            status={bug.status}
                            type={bug.type}
                            onStatusChange={(newStatus) => {
                                setBug({ ...bug, status: newStatus });
                                onStatusChange && onStatusChange(bugId, newStatus);
                            }}
                            isDeveloper={userRole === 'developer'}
                        />
                   </div>
                   <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs text-gray-500">CREATED</p>
                            <p className="text-sm font-medium text-gray-800">{new Date(bug.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 bg-gray-100 rounded-full p-2 hover:bg-gray-200 flex-shrink-0">
                            <X size={20} />
                        </button>
                   </div>
                </header>

                <div className="p-6 space-y-5">
                    <h1 className="text-2xl font-bold text-gray-900">{bug.title}</h1>

                    {(bug.bug_attachment?.path || selectedImage) ? (
                        <div className="relative">
                            <img
                                src={`${API_BASE_URL}/media/${selectedImage || bug.bug_attachment.path}`}
                                alt="Bug screenshot"
                                className="w-full h-64 object-contain rounded-lg bg-gray-50"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDEzLjUgNy41IDUgMTUiPjwvcG9seWxpbmU+PC9zdmc+';
                                }}
                            />
                            {(userRole === 'developer' || userRole === 'qa') && (
                                <label className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 cursor-pointer hover:bg-gray-50">
                                    <span className="text-sm font-medium text-gray-700">Change Image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            )}
                        </div>
                    ) : (userRole === 'developer' || userRole === 'qa') ? (
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 cursor-pointer hover:border-blue-500 transition-colors">
                            <div className="p-3 bg-gray-200 rounded-full">
                                <Image size={24} className="text-gray-500" />
                            </div>
                            <p className="mt-3 text-sm font-semibold text-gray-700">Upload Screenshot (.png or .gif only)</p>
                            <p className="mt-1 text-xs text-gray-500">Max file size: 5MB</p>
                            <input
                                type="file"
                                accept=".png,.gif"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </label>
                    ) : (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                            <div className="p-3 bg-gray-200 rounded-full">
                                <Image size={24} className="text-gray-500" />
                            </div>
                            <p className="mt-3 text-sm font-semibold text-gray-700">No screenshot available</p>
                            <p className="mt-1 text-xs text-gray-500">Only developers can add screenshots</p>
                        </div>
                    )}

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700">Bug details</label>
                            {userRole === 'developer' && !editMode && (
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                        {editMode && userRole === 'developer' ? (
                            <div className="space-y-3">
                                <textarea
                                    value={editedDetail}
                                    onChange={(e) => setEditedDetail(e.target.value)}
                                    className="w-full min-h-[120px] p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter bug details..."
                                />
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setEditMode(false);
                                            setEditedDetail(bug.detail || '');
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDetailUpdate}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-1 text-gray-600 bg-gray-50 p-3 rounded-md border min-h-[80px]">
                                {bug.detail || "No details provided."}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

