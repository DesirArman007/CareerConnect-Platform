import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { User, Heart, LogOut, ArrowUpRight } from 'lucide-react';
import { jobs as jobApi } from '../../services/api';
import { Job } from '../../types';
import { getCompanyIcon } from '../CompanyLogos';

export const DashboardPage: React.FC = () => {
    const { user, savedJobs, logout, updateProfile, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'saved'>('profile');

    // Profile Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);

    // Saved Jobs State
    const [savedJobsData, setSavedJobsData] = useState<Job[]>([]);
    const [isLoadingSaved, setIsLoadingSaved] = useState(false);

    // Load User Data into Form when user changes
    useEffect(() => {
        if (user) {
            setName(typeof user.name === 'string' ? user.name : '');
            setEmail(typeof user.email === 'string' ? user.email : '');
        }
    }, [user]);

    // Fetch saved jobs when tab is active or savedJobs changes
    useEffect(() => {
        const fetchSavedJobs = async () => {
            if (!savedJobs || savedJobs.length === 0) {
                setSavedJobsData([]);
                return;
            }
            setIsLoadingSaved(true);
            try {
                const promises = savedJobs.map(id => jobApi.getOne(id).catch(() => null));
                const results = await Promise.all(promises);
                setSavedJobsData(results.filter(Boolean) as Job[]);
            } catch (err) {
                console.error("Failed to fetch saved jobs", err);
            } finally {
                setIsLoadingSaved(false);
            }
        };

        if (activeTab === 'saved') {
            fetchSavedJobs();
        }
    }, [savedJobs, activeTab]);

    // Show loading while checking auth
    if (authLoading) {
        return (
            <main className="pt-24 min-h-screen flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </main>
        );
    }

    // Redirect if not logged in
    if (!user) {
        return <Navigate to="/login" />;
    }

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingProfile(true);
        try {
            await updateProfile({ name, email });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    // Safe string rendering helper
    const safeString = (value: any): string => {
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return String(value);
        return '';
    };

    return (
        <main className="pt-24 min-h-screen px-6 pb-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 space-y-6">
                        <div className="flex items-center gap-4 mb-8">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(safeString(user.name))}&background=random`}
                                alt={safeString(user.name)}
                                width={64}
                                height={64}
                                className="w-16 h-16 rounded-full border-2 border-accent"
                            />
                            <div>
                                <h2 className="font-bold text-lg">{safeString(user.name)}</h2>
                                <p className="text-xs text-gray-400">{safeString(user.email)}</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <User className="w-5 h-5" /> Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('saved')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'saved' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Heart className="w-5 h-5" /> Saved Jobs
                            </button>
                            <div className="pt-4 mt-4 border-t border-white/10">
                                <button
                                    onClick={() => { logout(); navigate('/'); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" /> Log Out
                                </button>
                            </div>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {activeTab === 'profile' && (
                            <section>
                                <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
                                <Card className="p-8 bg-surface/50 border-white/5 max-w-2xl">
                                    <form onSubmit={handleSaveProfile} className="space-y-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold">Personal Information</h3>
                                            {!isEditing && (
                                                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                                    Edit Profile
                                                </Button>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <Input
                                                label="Full Name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                disabled={!isEditing}
                                            />
                                            <Input
                                                label="Email Address"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>

                                        {isEditing && (
                                            <div className="flex gap-4 pt-4">
                                                <Button type="submit" disabled={isLoadingProfile}>
                                                    {isLoadingProfile ? 'Saving...' : 'Save Changes'}
                                                </Button>
                                                <Button type="button" variant="outline" onClick={() => {
                                                    setName(safeString(user.name));
                                                    setEmail(safeString(user.email));
                                                    setIsEditing(false);
                                                }}>Cancel</Button>
                                            </div>
                                        )}
                                    </form>
                                </Card>
                            </section>
                        )}

                        {activeTab === 'saved' && (
                            <section>
                                <h1 className="text-3xl font-bold mb-8">Saved Jobs</h1>
                                {isLoadingSaved ? (
                                    <div className="text-center py-12 text-gray-500">Loading saved jobs...</div>
                                ) : savedJobsData.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>You haven't saved any jobs yet.</p>
                                        <Button variant="outline" className="mt-4" onClick={() => navigate('/jobs')}>Browse Jobs</Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {savedJobsData.map(job => (
                                            <Card
                                                key={job._id || job.id}
                                                className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-surface/30 hover:bg-surface/50 cursor-pointer group"
                                                onClick={() => navigate(`/jobs/${job._id || job.id}`)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    {(() => {
                                                        const customIcon = getCompanyIcon(job.company, 48);
                                                        if (customIcon) {
                                                            return <div className="w-12 h-12 rounded-lg flex items-center justify-center">{customIcon}</div>;
                                                        }
                                                        if (job.logo) {
                                                            return <img src={job.logo} alt={job.company} width={48} height={48} className="w-12 h-12 rounded-lg bg-white/5" />;
                                                        }
                                                        return (
                                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                                                {job.company?.charAt(0) || 'J'}
                                                            </div>
                                                        );
                                                    })()}
                                                    <div>
                                                        <h3 className="font-bold text-lg group-hover:text-accent transition-colors">{job.title}</h3>
                                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                                            <span>{job.company}</span>
                                                            <span>•</span>
                                                            <span>{job.location}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                                                    <div className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400">
                                                        {job.type}
                                                    </div>
                                                    <Button variant="outline" size="sm" className="ml-auto md:ml-0">
                                                        View <ArrowUpRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};
