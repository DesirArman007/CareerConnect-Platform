import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { JobCard } from '../JobCard';
import {
    User,
    LogOut,
    Settings,
    Briefcase,
    ChevronDown,
    ChevronRight,
    ArrowUpRight,
    ExternalLink
} from 'lucide-react';
import { Job } from '../../types';

export const DashboardPage: React.FC = () => {
    const {
        user,
        savedJobs,
        logout,
        updateProfile,
        isLoading,
        savedJobsData,
        appliedJobsData,
        jobsDataLoading,
        fetchJobsData,
        toggleSaveJob,
    } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    /* ---------- STATE ---------- */
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'saved' | 'applied'>('profile');
    const [isJobsRepoOpen, setIsJobsRepoOpen] = useState(true);

    /* ---------- SYNC STATE ---------- */
    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    /* ---------- LAZY FETCH JOBS DATA (once per session) ---------- */
    useEffect(() => {
        if (user) {
            fetchJobsData();
        }
    }, [user, fetchJobsData]);

    /* ---------- HANDLERS ---------- */

    const handleRemoveJob = async (jobId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await toggleSaveJob(jobId);
            toast.success('Job removed from saved');
        } catch {
            toast.error('Failed to remove job');
        }
    };

    /* ---------- AUTH GUARDS ---------- */

    if (isLoading) {
        return (
            <main className="pt-24 min-h-screen flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </main>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ returnUrl: location.pathname }}
            />
        );
    }

    // 🔐 SAFE NON-NULL USER (for render)
    const authUser = user;

    /* ---------- PROFILE ---------- */

    const saveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;

        setSaving(true);
        try {
            await updateProfile({ name });
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    const saveEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;

        setSaving(true);
        try {
            await updateProfile({ email });
        } finally {
            setSaving(false);
        }
    };

    /* ---------- MAP ENRICHED DATA → JobCard-compatible shape ---------- */

    const savedJobsForCards: Job[] = savedJobsData
        .filter(entry => entry && entry.job !== null)
        .map(entry => ({
            id: ((entry.job as any)?.id || (entry.job as any)?._id || entry.jobId || entry.savedId) as string,
            title: entry.job?.title || 'Position',
            company: entry.job?.company || 'Company',
            location: entry.job?.location || 'Remote',
            salary: entry.job?.salary,
            apply_url: entry.job?.apply_url,
            logo: entry.job?.logo,
            employment_type: entry.job?.employment_type,
            createdAt: entry.savedAt || entry.createdAt
        }));

    const appliedJobsForCards: (Job & { appliedDate: string })[] = appliedJobsData
        .filter(entry => entry.job !== null)
        .map(entry => ({
            id: (entry.job!.id || entry.job!._id) as string,
            title: entry.job!.title || '',
            company: entry.job!.company || '',
            location: entry.job!.location || '',
            salary: entry.job!.salary,
            apply_url: entry.job!.apply_url,
            appliedDate: (entry as any).appliedAt || entry.createdAt || '',
        }));

    /* ---------- UI ---------- */

    return (
        <main className="pt-24 min-h-screen px-6 pb-24">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
                {/* SIDEBAR */}
                <aside className="w-full md:w-64 bg-black/40 p-4 rounded-xl border border-white/5 h-fit">
                    <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold overflow-hidden border border-white/10">
                            <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                alt={user.name}
                                width={36}
                                height={36}
                                className="w-9 h-9 rounded-full border border-white/10"
                            />
                        </div>
                        <div className="overflow-hidden">
                            <h2 className="font-bold truncate">{authUser.name}</h2>
                            <p className="text-xs text-gray-400 truncate">{authUser.email}</p>
                        </div>
                    </div>

                    <nav className="space-y-2 flex flex-col">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === 'profile' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <User size={18} /> Profile
                        </button>

                        <button
                            onClick={() => setIsJobsRepoOpen(!isJobsRepoOpen)}
                            className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors text-sm font-medium ${['saved', 'applied'].includes(activeTab) ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="flex gap-3 items-center">
                                <Briefcase size={18} /> Jobs Repo
                            </span>
                            {isJobsRepoOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>

                        {isJobsRepoOpen && (
                            <div className="ml-5 space-y-1 border-l border-white/10 pl-3 flex flex-col">
                                <button
                                    onClick={() => setActiveTab('applied')}
                                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === 'applied' ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    Applied Jobs
                                </button>
                                <button
                                    onClick={() => setActiveTab('saved')}
                                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === 'saved' ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    Saved Jobs
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-sm font-medium ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Settings size={18} /> Settings
                        </button>

                        <button
                            onClick={() => {
                                logout();
                                navigate('/');
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-sm font-medium text-red-500 hover:bg-red-500/10 mt-6"
                        >
                            <LogOut size={18} /> Sign out
                        </button>
                    </nav>
                </aside>

                {/* MAIN */}
                <div className="flex-1">
                    {activeTab === 'profile' && (
                        <Card className="p-8 max-w-xl">
                            <h1 className="text-3xl font-bold mb-8">Profile</h1>

                            <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                <div className="flex justify-between items-start mb-6 gap-4">
                                    <h2 className="text-xl font-bold leading-tight max-w-[60%]">
                                        Personal Information
                                    </h2>
                                    {!editing && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setEditing(true)}
                                            className="h-auto py-2 px-3 text-xs shrink-0"
                                        >
                                            Edit<br />Profile
                                        </Button>
                                    )}
                                </div>

                                <form onSubmit={saveProfile} className="space-y-6">
                                    <Input
                                        label="Full Name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        disabled={!editing}
                                    />
                                    <div>
                                        <Input
                                            label="Email Address"
                                            value={email}
                                            disabled
                                            className="overflow-hidden text-ellipsis"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">To change your email, please visit Settings.</p>
                                    </div>

                                    {editing && (
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                type="submit"
                                                disabled={saving || name === authUser.name}
                                            >
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditing(false);
                                                    setName(authUser.name);
                                                }}
                                                disabled={saving}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'settings' && (
                        <div>
                            <h1 className="text-3xl font-bold mb-8">Settings</h1>
                            <Card className="p-8 max-w-xl">
                                <form onSubmit={saveEmail} className="space-y-6">
                                    <h2 className="text-xl font-bold">Account Settings</h2>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Update Email Address
                                        </label>
                                        <Input
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            Please note that changing your email may require re-verification.
                                        </p>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={saving || email === authUser.email}
                                        className="bg-white text-black hover:bg-gray-200"
                                    >
                                        {saving ? 'Updating...' : 'Update Email'}
                                    </Button>
                                </form>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'saved' && (
                        <JobSection
                            title="Saved Jobs"
                            jobs={savedJobsForCards}
                            loading={jobsDataLoading}
                            navigate={navigate}
                            onRemove={handleRemoveJob}
                        />
                    )}

                    {activeTab === 'applied' && (
                        <JobSection
                            title="Applied Jobs"
                            jobs={appliedJobsForCards}
                            loading={jobsDataLoading}
                            navigate={navigate}
                            showDate
                        />
                    )}
                </div>
            </div>
        </main>
    );
};

/* ---------------- HELPER ---------------- */

const JobSection = ({
    title,
    jobs,
    loading,
    navigate,
    showDate,
    onRemove
}: any) => (
    <section>
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        {loading ? (
            <p className="text-gray-400">Loading...</p>
        ) : jobs.length === 0 ? (
            <p className="text-gray-400">No jobs found.</p>
        ) : (
            <div className="grid gap-4">
                {jobs.map((job: any) => (
                    <JobCard
                        key={job.id}
                        job={job}
                        variant={showDate ? 'applied' : (onRemove ? 'saved' : 'default')}
                        appliedDate={showDate ? job.appliedDate : undefined}
                        onRemove={onRemove ? (e) => onRemove(job.id, e) : undefined}
                    />
                ))}
            </div>
        )}
    </section>
);
