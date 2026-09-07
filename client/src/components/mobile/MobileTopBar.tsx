import React from 'react';
import { Bell, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../ui/Logo';

export const MobileTopBar: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className={`sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/5 px-4 h-14 flex items-center justify-between ${className}`}>
            {/* Brand */}
            <Logo
                size="sm"
                showText
                onClick={() => navigate('/')}
            />

            {/* Right Actions */}
            <div className="flex items-center gap-3">
                <button className="p-2 -mr-2 text-gray-400 hover:text-white">
                    <Bell className="w-5 h-5" />
                </button>
                {user ? (
                    <button onClick={() => navigate('/dashboard')}>
                        <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                            alt="Profile"
                            className="w-8 h-8 rounded-full border border-white/10"
                        />
                    </button>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors text-white"
                    >
                        <LogIn className="w-4 h-4" />
                        <span className="text-xs font-medium">Sign in</span>
                    </button>
                )}
            </div>
        </div>
    );
};
