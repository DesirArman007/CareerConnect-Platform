import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X } from 'lucide-react';
import { Button } from './ui/Button';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => handleNavigation('/')}>
            <div className="relative p-1">
              <div className="absolute inset-0 bg-accent blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <Sparkles className="w-6 h-6 text-white relative z-10" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-gray-200 transition-colors">
              Lumina
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <button onClick={() => navigate('/jobs')} className="hover:text-white transition-colors py-2">Jobs</button>
            <button onClick={() => navigate('/companies')} className="hover:text-white transition-colors py-2">Companies</button>
            <button onClick={() => navigate('/about')} className="hover:text-white transition-colors py-2">About</button>
          </nav>

          {/* Desktop Auth / Hamburger */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden md:block">
                  <div className="text-sm font-medium text-white">{user.name}</div>
                  <div className="text-xs text-center text-accent">Dashboard</div>
                </div>
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                  alt={user.name}
                  className="w-9 h-9 rounded-full border border-white/10"
                />
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="hidden md:block text-sm text-gray-400 hover:text-white transition-colors py-2 px-3">Log In</button>
                <Button variant="primary" size="sm" onClick={() => navigate('/signup')} className="hidden sm:flex">Sign Up</Button>
              </>
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
            <button
              onClick={() => handleNavigation('/jobs')}
              className="flex items-center h-12 px-4 rounded-lg text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors font-medium"
            >
              Jobs
            </button>
            <button
              onClick={() => handleNavigation('/companies')}
              className="flex items-center h-12 px-4 rounded-lg text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors font-medium"
            >
              Companies
            </button>
            <button
              onClick={() => handleNavigation('/about')}
              className="flex items-center h-12 px-4 rounded-lg text-left text-gray-300 hover:text-white hover:bg-white/10 transition-colors font-medium"
            >
              About
            </button>
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
                  className="w-8 h-8 rounded-full border border-white/10"
                />
                <div>
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-xs text-accent">Go to Dashboard</div>
                </div>
              </button>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center"
                  onClick={() => handleNavigation('/signup')}
                >
                  Sign Up
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-center"
                  onClick={() => handleNavigation('/login')}
                >
                  Log In
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

