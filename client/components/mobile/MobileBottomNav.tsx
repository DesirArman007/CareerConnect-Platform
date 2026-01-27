import React from 'react';
import { Home, Search, Building2, User, Info } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const MobileBottomNav: React.FC<{ className?: string }> = ({ className = '' }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Explore', path: '/explore', icon: Search },
        { name: 'Companies', path: '/companies', icon: Building2 },
        { name: 'About', path: '/about', icon: Info },
        { name: 'Profile', path: '/dashboard', icon: User },
    ];

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-lg border-t border-white/10 pb-[env(safe-area-inset-bottom)] ${className}`}>
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <button
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className="flex flex-col items-center justify-center w-full h-full gap-1"
                        >
                            <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-orange-500/10' : ''}`}>
                                <item.icon
                                    className={`w-5 h-5 transition-colors ${isActive ? 'text-orange-500' : 'text-gray-500'}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </div>
                            <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-orange-500' : 'text-gray-500'}`}>
                                {item.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
