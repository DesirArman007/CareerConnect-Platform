import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LogIn, Home, Search, Building2, Info, User as UserIcon, Settings, Briefcase, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';

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
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => handleNavigation('/')}>
            <img
              src="/assets/logo.png"
              alt="WorkRaze"
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-gray-200 transition-colors">
              WorkRaze
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {[
              { name: 'Home', path: '/', icon: Home },
              { name: 'Explore', path: '/explore', icon: Search },
              { name: 'Companies', path: '/companies', icon: Building2 },
              { name: 'About', path: '/about', icon: Info },
            ].map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Desktop Auth / Hamburger */}
          <div className="flex items-center gap-3 min-w-[100px] sm:min-w-[140px] justify-end">
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
                  {/* <ChevronsLeftRight className="w-4 h-4 text-gray-500 rotate-90" /> */}
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
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors text-white"
              >
                <LogIn className="w-5 h-5" />
                <span className="text-sm font-medium">Sign in</span>
              </button>
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
        <div className="flex flex-col h-full pt-20 pb-8 px-4">
          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {[
              { name: 'Home', path: '/', icon: Home },
              { name: 'Explore', path: '/explore', icon: Search },
              { name: 'Companies', path: '/companies', icon: Building2 },
              { name: 'About', path: '/about', icon: Info },
            ].map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
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

