import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import { JobCard } from '../JobCard';
import {
    User,
    LogOut,
    Settings,
    Briefcase,
    ChevronDown,
    ChevronRight,
    Pencil,
    Mail,
    Calendar,
    Shield
} from 'lucide-react';
import { Job } from '../../types';

export const DashboardPage: React.FC = () => {
    const {
        user,
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
    const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'saved' | 'applied'>(
        (location.state as any)?.tab || 'profile'
    );
    const [isJobsRepoOpen, setIsJobsRepoOpen] = useState(true);

    /* ---------- SYNC TAB FROM LOCATION STATE ---------- */
    useEffect(() => {
        if ((location.state as any)?.tab) {
            const tab = (location.state as any).tab;
            if (['profile', 'settings', 'saved', 'applied'].includes(tab)) {
                setActiveTab(tab);
            }
        }
    }, [location.state]);

    /* ---------- SYNC STATE ---------- */
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
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

    /* ---------- PROFILE ACTIONS ---------- */

    const saveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving || !name.trim()) return;

        setSaving(true);
        try {
            await updateProfile({ name: name.trim() });
            toast.success('Profile updated successfully');
            setEditing(false);
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const saveEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving || !email.trim()) return;

        setSaving(true);
        try {
            await updateProfile({ email: email.trim().toLowerCase() });
            toast.success('Email updated successfully');
        } catch {
            toast.error('Failed to update email');
        } finally {
            setSaving(false);
        }
    };

    const formatMemberSince = (dateStr?: string) => {
        if (!dateStr) return 'Jul 23, 2024';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return 'Jul 23, 2024';
            return d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return 'Jul 23, 2024';
        }
    };

    const getStatusText = (status?: string) => {
        if (!status) return 'Active';
        const lower = status.toLowerCase();
        if (lower === 'active') return 'Active';
        if (lower === 'inactive') return 'Inactive';
        if (lower === 'suspended') return 'Suspended';
        return status.charAt(0).toUpperCase() + status.slice(1);
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
            createdAt: entry.savedAt || entry.createdAt,
        }));

    const appliedJobsForCards: (Job & { appliedDate: string })[] = appliedJobsData
        .filter(entry => entry && entry.job !== null)
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
        <main className="pt-24 md:pt-28 min-h-screen px-4 sm:px-6 md:px-10 pb-24 text-white">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 lg:gap-12">
                {/* LEFT SIDEBAR CARD */}
                <aside className="w-full md:w-60 lg:w-64 shrink-0 bg-[#0e0e10] border border-white/5 rounded-2xl p-4 h-fit">
                    {/* User Identity at Top (Avatar + Name & Email) */}
                    <div className="flex items-center gap-3 mb-6 p-1">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0 bg-[#18181b] flex items-center justify-center">
                            <img
                                src={authUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.name || 'User')}&background=18181b&color=fff&size=128`}
                                alt={authUser.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-semibold text-white text-sm truncate">{authUser.name}</h2>
                            <p className="text-xs text-gray-400 truncate">{authUser.email}</p>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="space-y-1.5 flex flex-col">
                        {/* Profile Button */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                                activeTab === 'profile'
                                    ? 'bg-[#22160d] text-[#ff782d] border border-amber-900/30'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {activeTab === 'profile' && (
                                <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#ff5500] rounded-r-full" />
                            )}
                            <User className={`w-4 h-4 shrink-0 ${activeTab === 'profile' ? 'text-[#ff782d]' : 'text-gray-400'}`} />
                            <span>Profile</span>
                        </button>

                        {/* Jobs Repo Group */}
                        <div>
                            <button
                                type="button"
                                onClick={() => setIsJobsRepoOpen(!isJobsRepoOpen)}
                                className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    ['saved', 'applied'].includes(activeTab)
                                        ? 'text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Briefcase className="w-4 h-4 shrink-0 text-gray-400" />
                                    <span>Jobs Repo</span>
                                </div>
                                {isJobsRepoOpen ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </button>

                            {isJobsRepoOpen && (
                                <div className="ml-5 pl-4 border-l border-white/10 mt-1 space-y-1 flex flex-col">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('applied')}
                                        className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                            activeTab === 'applied'
                                                ? 'text-[#ff782d] bg-[#22160d]/70 font-semibold'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        Applied Jobs
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('saved')}
                                        className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                            activeTab === 'saved'
                                                ? 'text-[#ff782d] bg-[#22160d]/70 font-semibold'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        Saved Jobs
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Settings Button */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                                activeTab === 'settings'
                                    ? 'bg-[#22160d] text-[#ff782d] border border-amber-900/30'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {activeTab === 'settings' && (
                                <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#ff5500] rounded-r-full" />
                            )}
                            <Settings className={`w-4 h-4 shrink-0 ${activeTab === 'settings' ? 'text-[#ff782d]' : 'text-gray-400'}`} />
                            <span>Settings</span>
                        </button>

                        {/* Sign out Button */}
                        <button
                            type="button"
                            onClick={async () => {
                                await logout();
                                navigate('/');
                            }}
                            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#ef4444] hover:bg-red-500/10 transition-all mt-6"
                        >
                            <LogOut className="w-4 h-4 shrink-0 text-[#ef4444]" />
                            <span>Sign out</span>
                        </button>
                    </nav>
                </aside>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 min-w-0 max-w-3xl">
                    {/* TAB 1: PROFILE */}
                    {activeTab === 'profile' && (
                        <div>
                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Your Profile</h1>
                                <p className="text-xs md:text-sm text-gray-400 mt-1">
                                    Manage your personal information and account details.
                                </p>
                            </div>

                            {/* Section: Personal Information */}
                            <section className="mb-10">
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div>
                                        <h2 className="text-base md:text-lg font-bold text-white">Personal Information</h2>
                                        <p className="text-xs md:text-sm text-gray-400 mt-0.5">
                                            This information is shown on your account and used for job-related communication.
                                        </p>
                                    </div>

                                    {!editing ? (
                                        <button
                                            type="button"
                                            onClick={() => setEditing(true)}
                                            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#18181b] border border-white/10 hover:bg-white/10 text-xs md:text-sm font-medium text-white transition-all shrink-0"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            <span>Edit Profile</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditing(false);
                                                setName(authUser.name);
                                            }}
                                            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs md:text-sm font-medium text-gray-300 transition-all shrink-0"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={saveProfile} className="space-y-5">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
                                            Full Name
                                        </label>
                                        <div
                                            className={`flex items-center gap-3 w-full bg-[#111113] border rounded-lg px-4 h-11 transition-all ${
                                                editing
                                                    ? 'border-[#ff5500]/60 ring-1 ring-[#ff5500]/30'
                                                    : 'border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <User className="w-4 h-4 text-gray-400 shrink-0" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                disabled={!editing}
                                                className="bg-transparent border-none outline-none w-full text-sm text-white placeholder-gray-500 disabled:text-gray-200"
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                    </div>

                                    {/* Email Address */}
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
                                            Email Address
                                        </label>
                                        <div className="flex items-center gap-3 w-full bg-[#111113] border border-white/10 rounded-lg px-4 h-11">
                                            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                            <input
                                                type="email"
                                                value={email}
                                                disabled
                                                readOnly
                                                className="bg-transparent border-none outline-none w-full text-sm text-gray-300 disabled:opacity-90 cursor-not-allowed"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            To change your email, please visit{' '}
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('settings')}
                                                className="text-[#ff782d] hover:underline font-medium inline"
                                            >
                                                Settings
                                            </button>
                                            .
                                        </p>
                                    </div>

                                    {editing && (
                                        <div className="flex gap-3 pt-2">
                                            <Button
                                                type="submit"
                                                disabled={saving || name.trim() === authUser.name || !name.trim()}
                                                className="bg-[#ff5500] hover:bg-[#e04b00] text-white font-medium"
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
                            </section>

                            {/* Section: Account Information */}
                            <section>
                                <div className="mb-5">
                                    <h2 className="text-base md:text-lg font-bold text-white">Account Information</h2>
                                    <p className="text-xs md:text-sm text-gray-400 mt-0.5">
                                        Manage your account preferences and security.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                                    {/* Member Since Card */}
                                    <div className="bg-[#111113] border border-white/10 rounded-xl p-4 flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-lg bg-[#1a1a1e] border border-white/5 flex items-center justify-center text-gray-300 shrink-0">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-medium">Member Since</div>
                                            <div className="text-sm font-semibold text-white mt-0.5">
                                                {formatMemberSince(authUser.createdAt)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Status Card */}
                                    <div className="bg-[#111113] border border-white/10 rounded-xl p-4 flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-lg bg-[#1a1a1e] border border-white/5 flex items-center justify-center text-gray-300 shrink-0">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-medium">Account Status</div>
                                            <div className="text-sm font-semibold flex items-center gap-1.5 mt-0.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                                <span className="text-emerald-400 font-semibold">
                                                    {getStatusText(authUser.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* TAB 2: SETTINGS (Matching user screenshot) */}
                    {activeTab === 'settings' && (
                        <div>
                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Settings</h1>
                                <p className="text-xs md:text-sm text-gray-400 mt-1">
                                    Manage your account preferences and information.
                                </p>
                            </div>

                            {/* Settings Card */}
                            <div className="bg-[#0e0e10] border border-white/5 rounded-2xl p-6 md:p-8 max-w-3xl">
                                <form onSubmit={saveEmail}>
                                    {/* Card Header: Icon + Title + Description */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-[#1d140e] border border-amber-900/40 flex items-center justify-center shrink-0">
                                            <Mail className="w-5 h-5 text-[#ff782d]" />
                                        </div>
                                        <div>
                                            <h2 className="text-base md:text-lg font-bold text-white">Email Address</h2>
                                            <p className="text-xs md:text-sm text-gray-400 mt-0.5">
                                                Update your email address used for your account.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Email Input Field */}
                                    <div className="mt-8">
                                        <label className="block text-xs md:text-sm font-medium text-gray-300 mb-2">
                                            Email Address
                                        </label>
                                        <div className="flex items-center gap-3 w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-4 h-12 text-white focus-within:border-[#ff5500]/60 transition-all">
                                            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="bg-transparent border-none outline-none w-full text-sm text-white placeholder-gray-500"
                                                placeholder="Enter your email address"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Please note that changing your email may require re-verification.
                                        </p>
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex justify-end mt-8">
                                        <button
                                            type="submit"
                                            disabled={saving || email.trim() === authUser.email || !email.trim()}
                                            className="px-6 py-2.5 rounded-xl bg-[#ff5500] hover:bg-[#e04b00] text-white font-semibold text-sm transition-all shadow-[0_0_15px_rgba(255,85,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            {saving ? 'Updating...' : 'Update Email'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: SAVED JOBS */}
                    {activeTab === 'saved' && (
                        <JobSection
                            title="Saved Jobs"
                            subtitle="Review jobs you've bookmarked for later."
                            jobs={savedJobsForCards}
                            loading={jobsDataLoading}
                            navigate={navigate}
                            onRemove={handleRemoveJob}
                        />
                    )}

                    {/* TAB 4: APPLIED JOBS */}
                    {activeTab === 'applied' && (
                        <JobSection
                            title="Applied Jobs"
                            subtitle="Track the status of applications you have submitted."
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

interface JobSectionProps {
    title: string;
    subtitle: string;
    jobs: any[];
    loading: boolean;
    navigate: (path: string) => void;
    showDate?: boolean;
    onRemove?: (jobId: string, e: React.MouseEvent) => void;
}

const JobSection: React.FC<JobSectionProps> = ({
    title,
    subtitle,
    jobs,
    loading,
    navigate,
    showDate,
    onRemove,
}) => (
    <section>
        <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1">{subtitle}</p>
        </div>

        {loading ? (
            <div className="py-12 text-center text-gray-400">Loading jobs...</div>
        ) : jobs.length === 0 ? (
            <div className="py-12 px-6 rounded-xl border border-white/5 bg-[#111113] text-center">
                <p className="text-gray-400 text-sm">No jobs found in this section.</p>
                <button
                    type="button"
                    onClick={() => navigate('/explore')}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-medium text-white transition-all"
                >
                    Browse Jobs
                </button>
            </div>
        ) : (
            <div className="grid gap-4">
                {jobs.map((job: any) => (
                    <JobCard
                        key={job.id}
                        job={job}
                        variant={showDate ? 'applied' : onRemove ? 'saved' : 'default'}
                        appliedDate={showDate ? job.appliedDate : undefined}
                        onRemove={onRemove ? (e) => onRemove(job.id, e) : undefined}
                    />
                ))}
            </div>
        )}
    </section>
);

export default DashboardPage;
