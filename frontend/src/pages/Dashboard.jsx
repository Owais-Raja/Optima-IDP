import React from 'react';
import { useAuth } from '../store/useAuth.jsx';
import AdminDashboard from '../dashboards/AdminDashboard';
import ManagerDashboard from '../dashboards/ManagerDashboard';
import EmployeeDashboard from '../dashboards/EmployeeDashboard';
import QuickActions from '../components/Dashboard/QuickActions';

// =================================================================================================
// Dashboard Page Component
// -------------------------------------------------------------------------------------------------
// Main dashboard container that routes to the appropriate dashboard based on user role.
// Roles:
// - Admin -> AdminDashboard
// - Manager -> ManagerDashboard
// - Employee -> EmployeeDashboard
// =================================================================================================

function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || 'employee';
  const [isIDPModalOpen, setIsIDPModalOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <QuickActions
          role={role}
          onCreateIDP={() => setIsIDPModalOpen(true)}
        />

        {role === 'admin' && <AdminDashboard user={user} />}
        {role === 'manager' && <ManagerDashboard user={user} />}
        {role === 'employee' && (
          <EmployeeDashboard
            user={user}
            isCreateModalOpen={isIDPModalOpen}
            setIsCreateModalOpen={setIsIDPModalOpen}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
