import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Sun, Moon, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Simple toggle for dark mode (persisted in local state for session)
  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path ? "text-primary-600 dark:text-primary-400" : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200";

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/unais.png" alt="Logo" className="h-12 w-12 hover:scale-105 transition-transform duration-300" />
            <span className="font-display font-bold text-3xl text-stone-900 dark:text-white tracking-tight">storiesofunais</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`font-medium transition-colors ${isActive('/')}`}>Home</Link>
            <Link to="/stories" className={`font-medium transition-colors ${isActive('/stories')}`}>Stories</Link>
            {isAdmin && (
              <Link to="/admin" className={`font-medium transition-colors ${isActive('/admin')}`}>Dashboard</Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
              {isDark ? <Sun className="h-5 w-5 text-stone-400" /> : <Moon className="h-5 w-5 text-stone-500" />}
            </button>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200">
                    Sign in
                  </Link>
                  <Link to="/login?mode=signup" className="px-4 py-2 rounded-full bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-sm font-medium hover:opacity-90 transition-opacity">
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/stories"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/stories')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Stories
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}

            <div className="border-t border-stone-200 dark:border-stone-800 my-2 pt-2">
              {user ? (
                <>
                  <div className="px-3 py-2 text-base font-medium text-stone-700 dark:text-stone-300">
                    {user.name}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                  >
                    <div className="flex items-center space-x-2">
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/login?mode=signup"
                    className="block px-3 py-2 rounded-md text-base font-medium text-stone-900 dark:text-white font-bold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};