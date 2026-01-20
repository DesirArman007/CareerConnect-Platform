import React from 'react';
import { Sparkles, Menu } from 'lucide-react';
import { Button } from './ui/Button';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ... imports ... */

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="relative p-1">
            <div className="absolute inset-0 bg-accent blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            <Sparkles className="w-6 h-6 text-white relative z-10" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-gray-200 transition-colors">
            Lumina
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <button onClick={() => navigate('/jobs')} className="hover:text-white transition-colors">Jobs</button>
          <button onClick={() => navigate('/companies')} className="hover:text-white transition-colors">Companies</button>
          <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About</button>
        </nav>

        <div className="flex items-center gap-4">
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
              <button onClick={() => navigate('/login')} className="hidden md:block text-sm text-gray-400 hover:text-white transition-colors">Log In</button>
              <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>Sign Up</Button>
            </>
          )}
          <button className="md:hidden text-gray-400">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};
