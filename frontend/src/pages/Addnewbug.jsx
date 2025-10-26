import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Calendar, User, Paperclip } from 'lucide-react';
import API_BASE_URL from '../api/BaseApi';


export default function AddNewBugModal({ projectId, onClose, onBugAdded }) {
    const [title, setTitle] = useState('');
    const [detail, setDetail] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [deadline, setDeadline] = useState('');
    const [projectUsers, setProjectUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('access');
            try {
                const response = await axios.get(`${API_BASE_URL}/api/project-users/?project_id=${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProjectUsers(response.data);
            } catch (err) {
                console.error("Failed to fetch project users:", err);
            }
        };
        fetchUsers();
    }, [projectId]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) {
          setError('Bug title is required.');
          return;
        }
        setError('');
        setLoading(true);

        const bugData = {
            project: projectId,
            title,
            detail,
            assignee: assigneeId || null,
            deadline: deadline || null,
            status: 'New',
            type: 'Bug',
        };

        try {
            const token = localStorage.getItem('access');
            await axios.post(`${API_BASE_URL}/api/bugs/`, bugData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            onBugAdded();
            onClose();
        } catch (err) {
            setError('Failed to add bug. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-slide-up">
                <div className="flex justify-between items-center p-5 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Add new bug</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative w-full sm:w-1/2">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Assign to</option>
                                {projectUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                            </select>
                        </div>
                        <div className="relative w-full sm:w-1/2">
                             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="title" className="text-sm font-medium text-gray-700 mb-1 block">Add title</label>
                        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Convert the audio file received from Mobile app into text" required className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label htmlFor="detail" className="text-sm font-medium text-gray-700 mb-1 block">Bug details</label>
                        <textarea id="detail" value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Add here" rows="3" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                        <Paperclip size={24} className="text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Drop any file here or <span className="font-semibold text-blue-600">browse</span></p>
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

