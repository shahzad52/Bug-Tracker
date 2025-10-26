import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import api from '../lib/api';

export default function AddNewProjectModal({ user, onClose, onProjectAdded }) {
    const [formData, setFormData] = useState({
        name: '',
        detail: '',
        manager: user?.id
    });
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!formData.manager) {
                throw new Error('Manager ID is required');
            }

            let projectData = { ...formData };

            if (logo) {
                const fileData = new FormData();
                fileData.append('file', logo);
                fileData.append('type', 'project_logo');

                const uploadResponse = await api.post('/upload/', fileData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                projectData.logo = uploadResponse.data.path;
            }

            await api.post('/projects/', projectData);
            onProjectAdded();
            onClose();
            resetForm();
        } catch (error) {
            console.error('Project creation error:', error);
            if (error.message === 'Manager ID is required') {
                setError('Manager information is missing. Please try logging in again.');
            } else if (error.response?.data) {

                const errorMessage = typeof error.response.data === 'object' 
                    ? Object.values(error.response.data).join('. ')
                    : error.response.data;
                setError(errorMessage);
            } else {
                setError('Failed to create project. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', detail: '', manager: user?.id });
        setLogo(null);
        setLogoPreview(null);
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="detail"
                            value={formData.detail}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Logo
                        </label>
                        <div className="flex items-center space-x-4">
                            {logoPreview ? (
                                <div className="relative">
                                    <img src={logoPreview} alt="Logo preview" className="w-16 h-16 object-cover rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLogo(null);
                                            setLogoPreview(null);
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                    <Upload size={20} className="text-gray-400" />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

