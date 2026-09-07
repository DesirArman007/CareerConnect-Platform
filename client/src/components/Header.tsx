import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LogIn, Home, Search, Building2, Info, User as UserIcon, Settings, Briefcase, LogOut, ChevronDown, ChevronRight, PlusCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Logo } from './ui/Logo';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Profile dropdown state
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isJobsRepoOpen, setIsJobsRepoOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  // Click outside to close profile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleProfileNavigation = (tab: string) => {
    navigate('/dashboard', { state: { tab } });
    setIsProfileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  return (
    <>
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Logo
            size="md"
            showText
            onClick={() => handleNavigation('/')}
          />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { name: 'Home', path: '/' },
              { name: 'Find Jobs', path: '/explore' },
              { name: 'Companies', path: '/companies' },
              { name: 'About Us', path: '/about' },
            ].map((item) => {
              const isActive = (item.path === '/' && location.pathname === '/') ||
                (item.path === '/explore' && (location.pathname === '/explore' || location.pathname.startsWith('/jobs'))) ||
                (item.path === '/companies' && location.pathname.startsWith('/company/')) ||
                (item.path !== '/' && item.path !== '/explore' && location.pathname.startsWith(item.path));

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`relative py-1 text-sm font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5500] rounded-full" />
                  )}
                </button>
              );
            })}

            {/* Post Job - Employer Only */}
            {user?.role === 'employer' && (
              <button
                onClick={() => handleNavigation('/employer/post-job')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30 ${location.pathname === '/employer/post-job' ? 'ring-2 ring-orange-500/50' : ''}`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Post Job
              </button>
            )}
          </nav>

          {/* Desktop Auth / Actions */}
          <div className="flex items-center gap-4 min-w-[100px] sm:min-w-[140px] justify-end">
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className="text-right hidden md:block">
                    <div className="text-sm font-medium text-white">{user.name}</div>
                  </div>
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                    alt={user.name}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full border border-white/10"
                  />
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => handleProfileNavigation('profile')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <UserIcon className="w-4 h-4" /> Profile
                      </button>

                      {/* Jobs Repo Group */}
                      <div>
                        <button
                          onClick={() => setIsJobsRepoOpen(!isJobsRepoOpen)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Briefcase className="w-4 h-4" /> Jobs Repo
                          </div>
                          {isJobsRepoOpen ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
                        </button>

                        {isJobsRepoOpen && (
                          <div className="ml-4 pl-4 border-l border-white/10 mt-1 space-y-1">
                            <button
                              onClick={() => handleProfileNavigation('applied')}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              Applied Jobs
                            </button>
                            <button
                              onClick={() => handleProfileNavigation('saved')}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              Saved Jobs
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleProfileNavigation('settings')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </button>

                      <div className="my-1 border-t border-white/10" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-xl transition-all text-white text-sm font-medium"
                >
                  <UserIcon className="w-4 h-4 text-gray-300" />
                  <span>Sign in</span>
                </button>
              </div>
            )}

            {/* Hamburger Button - 44x44 touch target */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[280px] max-w-[80vw] bg-surface border-l border-white/10 z-50 md:hidden transition-transform duration-300 ease-out overflow-y-auto overflow-x-hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full pt-6 pb-8 px-4">
          {/* Drawer Top Header with Logo */}
          <div className="flex items-center justify-between pb-6 mb-2 border-b border-white/5">
            <Logo size="sm" showText onClick={() => handleNavigation('/')} />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {[
              { name: 'Home', path: '/', icon: Home },
              { name: 'Explore', path: '/explore', icon: Search },
              { name: 'Companies', path: '/companies', icon: Building2 },
              { name: 'About', path: '/about', icon: Info },
            ].map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path === '/companies' && location.pathname.startsWith('/company/')) ||
                (item.path !== '/' && item.path !== '/companies' && location.pathname.startsWith(item.path));
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </button>
              );
            })}

            {/* Post Job - Employer Only (Mobile) */}
            {user?.role === 'employer' && (
              <button
                onClick={() => handleNavigation('/employer/post-job')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30"
              >
                <PlusCircle className="w-5 h-5" />
                Post Job
              </button>
            )}
          </nav>

          {/* Divider */}
          <div className="my-6 border-t border-white/10" />

          {/* Auth Section */}
          <div className="flex flex-col gap-3">
            {user ? (
              <button
                onClick={() => handleNavigation('/dashboard')}
                className="flex items-center gap-3 h-12 px-4 rounded-lg text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full border border-white/10"
                />
                <div>
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-xs text-accent">Go to Dashboard</div>
                </div>
              </button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-center flex items-center gap-2"
                onClick={() => handleNavigation('/login')}
              >
                <LogIn className="w-5 h-5" />
                Sign in
              </Button>
            )}
          </div>
        </div>
      </div >
    </>
  );
};

