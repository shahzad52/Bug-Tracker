import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Calendar, User, Paperclip } from 'lucide-react';
import API_BASE_URL from '../../api/BaseApi';



export default function AddNewBugModal({ projectId, onClose, onBugAdded }) {
    const [title, setTitle] = useState('');
    const [detail, setDetail] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [deadline, setDeadline] = useState('');
    const [projectUsers, setProjectUsers] = useState([]);
    const [type, setType] = useState('bug');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [attachment, setAttachment] = useState(null);
    const [attachmentPreview, setAttachmentPreview] = useState(null);

    useEffect(() => {
        const fetchProjectDevelopers = async () => {
            const token = localStorage.getItem('access');
            try {
                const projectUsersResponse = await axios.get(
                    `${API_BASE_URL}/api/project-users/?project=${projectId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const usersResponse = await axios.get(
                    `${API_BASE_URL}/api/users/`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const developers = projectUsersResponse.data
                    .filter(projectUser => {
                        const user = usersResponse.data.find(u => u.id === projectUser.user);
                        return projectUser.project === Number(projectId) && user?.role === 'developer';
                    })
                    .map(projectUser => {
                        const user = usersResponse.data.find(u => u.id === projectUser.user);
                        return {
                            ...projectUser,
                            user_name: user?.name || user?.email || `Developer ${projectUser.user}`
                        };
                    });

                setProjectUsers(developers);
            } catch (err) {
                console.error("Failed to fetch project developers:", err);
            }
        };
        fetchProjectDevelopers();
    }, [projectId]); 
    
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!['image/png', 'image/gif'].includes(file.type)) {
                setError('Please upload only PNG or GIF files');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('File size should be less than 5MB');
                return;
            }
            setAttachment(file);
            setAttachmentPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) {
          setError('Bug title is required.');
          return;
        }
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('access');
            const userResponse = await axios.get(`${API_BASE_URL}/api/auth/me/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let attachmentPath = null;
            if (attachment) {
                const formData = new FormData();
                formData.append('file', attachment);
                formData.append('type', 'bug_attachment');
                
                const uploadResponse = await axios.post(`${API_BASE_URL}/api/upload/`, formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                attachmentPath = uploadResponse.data.path;
            }

            const bugData = {
                project: projectId,
                title,
                detail,
                type,
                status: 'new',
                assignee: assigneeId ? Number(assigneeId) : null,
                deadline: deadline || null,
                creator: userResponse.data.id,
                bug_attachment: attachmentPath ? { 
                    path: uploadResponse.data.path,
                    filename: uploadResponse.data.filename
                } : null
            };

            await axios.post(`${API_BASE_URL}/api/bugs/`, bugData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            onBugAdded();
            onClose();
        } catch (err) {
            console.error("Failed to add bug:", err.response?.data || err.message);
            setError('Failed to add bug. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-auto h-auto animate-slide-up">
                <div className="flex justify-between items-center p-5 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Add new bug</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative w-full sm:w-1/3">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <select 
                                value={assigneeId} 
                                onChange={(e) => setAssigneeId(e.target.value)} 
                                className="w-full pl-10 pr-4 py-2.5 bg-white text-black border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Assign to</option>
                                {projectUsers.length === 0 ? (
                                    <option disabled>No developers available</option>
                                ) : (
                                    projectUsers.map(member => (
                                        <option key={member.id} value={member.user}>
                                            {member.user_name || `Developer ${member.user}`}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div className="relative w-full sm:w-1/3">
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white text-black border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="bug">Bug</option>
                                <option value="feature">Feature</option>
                            </select>
                        </div>
                        <div className="relative w-full sm:w-1/3">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="date" 
                                value={deadline} 
                                onChange={(e) => setDeadline(e.target.value)} 
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="title" className="text-sm font-medium text-gray-700 mb-1 block">Add title</label>
                        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add bug title here " required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label htmlFor="detail" className="text-sm font-medium text-gray-700 mb-1 block">Bug details</label>
                        <textarea id="detail" value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Add here" rows="3" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Bug Screenshot</label>
                        <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                            {attachmentPreview ? (
                                <div className="relative w-full">
                                    <img 
                                        src={attachmentPreview} 
                                        alt="Bug screenshot preview" 
                                        className="max-h-48 mx-auto rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setAttachment(null);
                                            setAttachmentPreview(null);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Paperclip size={24} className="text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">
                                        Upload screenshot (PNG or GIF) or <span className="font-semibold text-blue-600">browse</span>
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">Max file size: 5MB</p>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/png,image/gif"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                     {error && <p className="text-sm text-red-600">{error}</p>}
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                            {loading ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

