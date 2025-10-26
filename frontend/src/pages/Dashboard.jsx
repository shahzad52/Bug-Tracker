import React from 'react';
import { useOutletContext } from 'react-router-dom';
import ManagerDashboard from './dashboard/ManagerDashboard.jsx';
import DeveloperDashboard from './dashboard/DeveloperDashboard.jsx';
import QADashboard from './dashboard/QADashboard.jsx';

export default function Dashboard() {
  const { user } = useOutletContext();

  if (!user) {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  switch (user.role) {
    case 'manager':
      return <ManagerDashboard user={user} />;
    case 'developer':
      return <DeveloperDashboard user={user} />;
    case 'qa':
      return <QADashboard user={user} />;
    default:
      return <div className="p-8 text-center text-red-500">Error: Invalid user role detected.</div>;
  }
}

