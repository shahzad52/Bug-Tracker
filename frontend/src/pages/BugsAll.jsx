import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, LayoutGrid, List, Plus } from 'lucide-react';
import BugTable from '../components/bugs/BugsTable.jsx';
import BugsGrid from '../components/bugs/BugsGrid';
import API_BASE_URL from '../api/BaseApi.jsx';

export default function BugsAll() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const fetchBugs = async () => {
      setLoading(true);
      const token = localStorage.getItem("access");
      try {
        const response = await axios.get(`${API_BASE_URL}/api/bugs/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBugs(response.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchBugs();
  }, []);

  const filteredBugs = bugs.filter(bug =>
    bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bug.description && bug.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col space-y-2">
       
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">All bugs listing</h1>
          
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Assigned To</span>
            <select className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All</option>
            </select>
          </div>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-blue-500' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-blue-500' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {viewMode === 'grid' ? (
          <BugsGrid bugs={filteredBugs} />
        ) : (
          <BugTable bugs={filteredBugs} />
        )}
      </div>
    </div>
  );
}
