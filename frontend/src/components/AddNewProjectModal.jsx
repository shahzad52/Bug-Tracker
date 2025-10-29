import React, { useState } from 'react';
import axios from "axios";
import { X, Upload } from 'lucide-react';
import api from '../lib/api';
import API_BASE_URL from '../api/BaseApi';

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

    const generateWithAI = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.post(
                `${API_BASE_URL}/generate-ai/`,
                { prompt: `Generate a short 2 lines only project description (plaintext without any headings) for this project titled "${formData.name}" (for a bugtracking application.)` },
                { headers: { "Content-Type": "application/json" } }
            );
            const aiText = response.data.response || "No details generated.";
            setFormData(prev => ({
                ...prev,
                detail: aiText,
            }));
        } catch (error) {
            console.error("AI generation failed:", error);
            setError("Failed to generate details using AI.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] mx-4 overflow-auto">
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

                    <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">

                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-s font-medium text-gray-700 mb-2">
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
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-s font-medium text-black-700">
                                        Short Details
                                    </label>
                                    <button
                                        type="button"
                                        onClick={generateWithAI}
                                        disabled={loading || !formData.name}
                                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Generate with AI
                                    </button>
                                </div>
                                <textarea
                                    name="detail"
                                    value={formData.detail}
                                    onChange={handleInputChange}
                                    rows="5"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project Logo
                            </label>

                            <label htmlFor="logo-upload" className="cursor-pointer">
                                {logoPreview ? (
                                    <div className="relative">
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="w-full h-40 object-cover rounded-lg border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setLogo(null);
                                                setLogoPreview(null);
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50">
                                        <Upload size={32} className="text-gray-400 mb-2" />
                                        <span>Upload logo</span>
                                    </div>
                                )}
                            </label>

                            <input
                                id="logo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
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

