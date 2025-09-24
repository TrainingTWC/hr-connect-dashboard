import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowError(false);

    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(password);
    
    if (!success) {
      setShowError(true);
      setPassword('');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <img 
              src={`${(import.meta as any).env?.BASE_URL || '/'}assets/logo.png`}
              alt="Third Wave Coffee Logo"
              className="w-32 h-32 object-contain drop-shadow-lg bg-white rounded-2xl p-4"
              onError={(e) => {
                // Fallback SVG if logo.png is not found
                const fallbackSVG = document.createElement('div');
                fallbackSVG.className = 'w-32 h-32 bg-slate-800 dark:bg-slate-200 rounded-2xl flex items-center justify-center drop-shadow-lg';
                fallbackSVG.innerHTML = `
                  <svg width="80" height="80" viewBox="0 0 200 200" class="text-white dark:text-slate-800">
                    <g transform="translate(100,100)">
                      <path d="M 45 -20 Q 65 -20 65 0 Q 65 20 45 20" fill="none" stroke="currentColor" stroke-width="4"/>
                      <circle cx="0" cy="0" r="40" fill="none" stroke="currentColor" stroke-width="4"/>
                      <circle cx="0" cy="0" r="32" fill="currentColor"/>
                      <path d="M -25 -8 Q -12 -16 0 -8 Q 12 0 25 -8" fill="none" stroke="white" stroke-width="2"/>
                      <path d="M -20 8 Q -8 0 8 8 Q 20 16 32 8" fill="none" stroke="white" stroke-width="2"/>
                    </g>
                  </svg>
                `;
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  parent.replaceChild(fallbackSVG, e.target as HTMLElement);
                }
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            Third Wave Coffee
          </h1>
          <h2 className="text-2xl font-semibold text-sky-500 dark:text-sky-400 mb-4">
            HR Connect Dashboard
          </h2>
          <p className="text-gray-600 dark:text-slate-400">
            Please enter your password to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
                  disabled={isLoading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {showError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <div className="flex items-center">
                  <span className="text-red-400 mr-2">⚠️</span>
                  <span className="text-red-700 dark:text-red-400 text-sm font-medium">
                    Incorrect password. Please try again.
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full bg-sky-400 hover:bg-sky-500 disabled:bg-gray-300 dark:disabled:bg-slate-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            <div className="bg-sky-50 dark:bg-slate-700 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-sky-400 mr-2 mt-0.5">ℹ️</span>
                <div className="text-sm text-sky-700 dark:text-sky-300">
                  <p className="font-medium mb-1">Secure Access</p>
                  <p>Your login session will remain active for 24 hours on this device.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Having trouble accessing the dashboard?
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Contact your administrator for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;