import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { User, Heart, LogOut, ArrowUpRight, Briefcase, Settings, ChevronDown, ChevronRight, LayoutDashboard, ChevronsLeftRight } from 'lucide-react';
import { jobs as jobApi } from '../../services/api';
import { Job } from '../../types';
import { getCompanyIcon } from '../CompanyLogos';

export const DashboardPage: React.FC = () => {
    const { user, savedJobs, logout, updateProfile, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<'profile' | 'saved' | 'applied' | 'settings'>('profile');
    const [isJobsRepoOpen, setIsJobsRepoOpen] = useState(true);

    // Handle incoming tab requests
    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
            // Optional: clear state so refresh doesn't stick?
            // navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);

    // Profile Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);

    // Saved Jobs State
    const [savedJobsData, setSavedJobsData] = useState<Job[]>([]);
    const [isLoadingSaved, setIsLoadingSaved] = useState(false);

    // Applied Jobs State
    const [appliedJobsData, setAppliedJobsData] = useState<(Job & { appliedDate: string })[]>([]);
    const [isLoadingApplied, setIsLoadingApplied] = useState(false);

    // Load User Data into Form
    useEffect(() => {
        if (user) {
            setName(typeof user.name === 'string' ? user.name : '');
            setEmail(typeof user.email === 'string' ? user.email : '');
        }
    }, [user]);

    // Fetch saved jobs
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

    // Fetch Applied Jobs
    useEffect(() => {
        const fetchAppliedJobs = async () => {
            if (!user?.appliedJobs || user.appliedJobs.length === 0) {
                setAppliedJobsData([]);
                return;
            }
            setIsLoadingApplied(true);
            try {
                const promises = user.appliedJobs.map(async (app) => {
                    try {
                        const job = await jobApi.getOne(app.jobId);
                        if (job) return { ...job, appliedDate: app.date };
                        return null;
                    } catch { return null; }
                });
                const results = await Promise.all(promises);
                setAppliedJobsData(results.filter(Boolean) as any);
            } catch (err) {
                console.error("Failed to fetch applied jobs", err);
            } finally {
                setIsLoadingApplied(false);
            }
        };

        if (activeTab === 'applied') {
            fetchAppliedJobs();
        }
    }, [user?.appliedJobs, activeTab]);

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

    // Safe string rendering helper
    const safeString = (value: any): string => {
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return String(value);
        return '';
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingProfile(true);
        try {
            // Only update name from this section
            await updateProfile({ name });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingSettings(true);
        try {
            await updateProfile({ email });
            // Optional: show success message
        } catch (error) {
            console.error("Failed to update settings", error);
        } finally {
            setIsLoadingSettings(false);
        }
    };

    return (
        <main className="pt-24 min-h-screen px-6 pb-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 space-y-2 bg-black/40 rounded-xl p-4 border border-white/5 h-fit">
                        {/* User Profile Section - Top */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(safeString(user.name))}&background=random`}
                                    alt={safeString(user.name)}
                                    className="w-10 h-10 rounded-full border border-white/10"
                                />
                                <div className="min-w-0">
                                    <h2 className="font-bold text-sm truncate">{safeString(user.name)}</h2>
                                    <p className="text-xs text-gray-400 truncate">{safeString(user.email)}</p>
                                </div>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${activeTab === 'profile' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <User className="w-4 h-4" /> Profile
                            </button>

                            {/* Jobs Repo Section */}
                            <div>
                                <button
                                    onClick={() => setIsJobsRepoOpen(!isJobsRepoOpen)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm ${activeTab === 'saved' || activeTab === 'applied' ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Briefcase className="w-4 h-4" /> Jobs Repo
                                    </div>
                                    {isJobsRepoOpen ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
                                </button>

                                {isJobsRepoOpen && (
                                    <div className="ml-4 pl-4 border-l border-white/10 mt-1 space-y-1">
                                        <button
                                            onClick={() => setActiveTab('applied')}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${activeTab === 'applied' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            Applied Jobs
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('saved')}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${activeTab === 'saved' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            Saved Jobs
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Settings className="w-4 h-4" /> Settings
                            </button>

                            <button
                                onClick={() => { logout(); navigate('/'); }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                            >
                                <LogOut className="w-4 h-4" /> Sign out
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {activeTab === 'profile' && (
                            <section>
                                <h1 className="text-3xl font-bold mb-8">Profile</h1>
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
                                                className={!isEditing ? "bg-white/5 border-transparent" : ""}
                                            />
                                            <div className='opacity-60'>
                                                <Input
                                                    label="Email Address"
                                                    type="email"
                                                    value={user.email} // Use user.email directly to confirm it's not editable here
                                                    disabled={true} // Always disabled in profile
                                                    className="bg-white/5 border-transparent cursor-not-allowed"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">To change your email, please visit Settings.</p>
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <div className="flex gap-4 pt-4">
                                                <Button type="submit" disabled={isLoadingProfile}>
                                                    {isLoadingProfile ? 'Saving...' : 'Save Changes'}
                                                </Button>
                                                <Button type="button" variant="outline" onClick={() => {
                                                    setName(safeString(user.name));
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

                        {activeTab === 'applied' && (
                            <section>
                                <h1 className="text-3xl font-bold mb-8">Applied Jobs</h1>
                                {isLoadingApplied ? (
                                    <div className="text-center py-12 text-gray-500">Loading application history...</div>
                                ) : appliedJobsData.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>You haven't applied to any jobs yet.</p>
                                        <Button variant="outline" className="mt-4" onClick={() => navigate('/jobs')}>Start Applying</Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {appliedJobsData.map(job => (
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
                                                            <span className="hidden sm:inline">•</span>
                                                            <span className="hidden sm:inline">{job.location}</span>
                                                        </div>
                                                        <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                                            Applied on {new Date(job.appliedDate).toLocaleDateString()}
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

                        {activeTab === 'settings' && (
                            <section>
                                <h1 className="text-3xl font-bold mb-8">Settings</h1>
                                <Card className="p-8 bg-surface/50 border-white/5 max-w-2xl">
                                    <h3 className="text-xl font-bold mb-6">Account Settings</h3>
                                    <form onSubmit={handleSaveSettings} className="space-y-6">
                                        <div className="space-y-2">
                                            <Input
                                                label="Update Email Address"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter new email address"
                                            />
                                            <p className="text-xs text-gray-400">
                                                Please note that changing your email may require re-verification.
                                            </p>
                                        </div>
                                        <div className="pt-2">
                                            <Button type="submit" disabled={isLoadingSettings}>
                                                {isLoadingSettings ? 'Updating...' : 'Update Email'}
                                            </Button>
                                        </div>
                                    </form>
                                </Card>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

