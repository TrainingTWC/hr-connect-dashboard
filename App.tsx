
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Survey from './components/Survey';
import Header from './components/Header';
import { getUserRole, UserRole } from './roleMapping';
import { ThemeProvider } from './contexts/ThemeContext';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'survey'>('dashboard');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get user ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const userIdParam = urlParams.get('userId') || urlParams.get('id') || urlParams.get('user');
    
    if (userIdParam) {
      setUserId(userIdParam);
      
      // Try to get role immediately
      let role = getUserRole(userIdParam);
      
      if (role) {
        setUserRole(role);
        setLoading(false);
      } else {
        // If no role found, wait for role mappings to load and retry
        console.log(`Waiting for role mappings to load for user: ${userIdParam}`);
        
        const checkForRole = () => {
          const retryRole = getUserRole(userIdParam);
          if (retryRole) {
            setUserRole(retryRole);
            setLoading(false);
          } else {
            // Retry after a short delay
            setTimeout(checkForRole, 100);
          }
        };
        
        // Start checking after a brief delay to allow for async loading
        setTimeout(checkForRole, 200);
        
        // Fallback timeout - stop trying after 5 seconds
        setTimeout(() => {
          if (!userRole) {
            console.warn(`No role found for user ID after timeout: ${userIdParam}`);
            setLoading(false);
          }
        }, 5000);
      }
    } else {
      console.warn('No user ID found in URL parameters');
      // For development, you can set a default admin user
      setUserId('admin001');
      setUserRole(getUserRole('admin001'));
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-slate-400">Loading user permissions...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!userRole) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Access Denied</h1>
            <p className="text-gray-500 dark:text-slate-400">User ID "{userId}" not found or not authorized.</p>
            <p className="text-gray-400 dark:text-slate-500 text-sm mt-2">Please contact your administrator.</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'survey', label: 'Survey', icon: '📝' }
  ];

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100">
        <Header />
        
        {/* User Info */}
        <div className="px-4 sm:px-6 lg:px-8 py-2 bg-gray-100 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500 dark:text-slate-400">Logged in as: </span>
              <span className="text-sm font-medium text-gray-700 dark:text-slate-200">{userRole.name}</span>
              <span className="text-xs text-gray-400 dark:text-slate-500 ml-2">({userRole.role.replace('_', ' ').toUpperCase()})</span>
            </div>
            <div className="text-xs text-gray-400 dark:text-slate-500">
              User ID: {userId}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-slate-700">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'dashboard' | 'survey')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <main className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && <Dashboard userRole={userRole} />}
          {activeTab === 'survey' && <Survey userRole={userRole} />}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;
