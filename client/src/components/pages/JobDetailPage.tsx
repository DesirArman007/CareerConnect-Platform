import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Job } from '../../types';
import {
    Home,
    ChevronRight,
    MapPin,
    Briefcase,
    Building2,
    Globe,
    Calendar,
    Bookmark,
    Share2,
    ExternalLink,
    Users,
    ArrowUpRight,
    ArrowRight,
    Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobApi } from '../../services/jobs.api';
import { formatDescription } from '../../utils/formatJobDescription';
import { parseJobSections } from '../../utils/parseJobSections';
import { openExternalLink } from '../../utils/security';
import { CompanyLogo } from '../CompanyLogo';
/* ---------- HELPERS ---------- */

const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Recent';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
};

/* ---------- MAIN COMPONENT ---------- */

export const JobDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const { user, toggleSaveJob, isJobSaved, markJobAsApplied } = useAuth();

    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('Overview');

    /* ---------- FETCH JOB ---------- */

    useEffect(() => {
        const fetchJob = async () => {
            if (!id) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await jobApi.getOne(id);

                if (!response.success || !response.data?.job) {
                    throw new Error('Job not found');
                }

                const currentJob = response.data.job;
                setJob(currentJob);
            } catch (err: any) {
                console.error('Failed to fetch job details', err);
                setError(err.message || 'Failed to fetch job details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJob();
    }, [id]);

    /* ---------- NORMALIZED FIELDS ---------- */

    const jobId = job?.id ?? job?._id;
    const applyUrl = job?.apply_url ?? job?.applyUrl ?? null;
    const employmentType = job?.employment_type ?? 'Full-time';
    const postedDate = formatDate(job?.createdAt);

    const rawWorkplaceType = (job as any)?.workplace_type;
    const workplaceType = typeof rawWorkplaceType === 'string' && /^(remote|hybrid)$/i.test(rawWorkplaceType.trim())
        ? rawWorkplaceType.trim()
        : undefined;

    const isSaved = jobId ? isJobSaved(jobId) : false;
    const appliedEntry = user?.appliedJobs?.find(a => a.jobId === jobId);
    const isApplied = !!appliedEntry;

    const tags = useMemo(() => {
        const rawTags = Array.isArray(job?.tags) ? job.tags : [];
        return rawTags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0);
    }, [job?.tags]);

    const companyMetadata = (job as any)?.companyDetails ?? (job as any)?.company_metadata ?? {};
    const companyTagline = typeof companyMetadata.tagline === 'string' ? companyMetadata.tagline.trim() : '';
    const companySize = typeof companyMetadata.size === 'string' ? companyMetadata.size.trim() : '';
    const companyIndustry = typeof companyMetadata.industry === 'string' ? companyMetadata.industry.trim() : '';
    const companyHq = typeof companyMetadata.hq === 'string' ? companyMetadata.hq.trim() : '';

    // Dynamically parse actual responsibilities and requirements from job description
    const { responsibilities, requirements } = useMemo(() => {
        return parseJobSections(job?.description);
    }, [job?.description]);

    // Available tabs based on what actual content exists for this job
    const availableTabs = useMemo(() => {
        const tabs = ['Overview'];
        if (responsibilities.length > 0) tabs.push('Responsibilities');
        if (requirements.length > 0) tabs.push('Requirements');
        return tabs;
    }, [responsibilities.length, requirements.length]);

    // Keep activeTab valid if availableTabs change
    useEffect(() => {
        if (!availableTabs.includes(activeTab)) {
            setActiveTab('Overview');
        }
    }, [availableTabs, activeTab]);

    /* ---------- ACTIONS ---------- */

    const requireAuth = () => {
        navigate('/login', {
            state: {
                message: 'You need to be logged in to continue',
                returnUrl: location.pathname
            }
        });
    };

    const handleSave = async () => {
        if (!user) return requireAuth();
        if (jobId) {
            const willBeSaved = !isSaved;
            try {
                await toggleSaveJob(jobId);
                toast.success(willBeSaved ? 'Job saved successfully' : 'Job removed from saved');
            } catch (err: any) {
                toast.error(err?.message || 'Failed to update saved job');
            }
        }
    };

    const handleShare = async () => {
        if (!navigator.clipboard) {
            toast.error('Clipboard is not available');
            return;
        }
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Job link copied to clipboard!');
        } catch {
            toast.error('Failed to copy the job link');
        }
    };

    const handleApply = async () => {
        if (!user) return requireAuth();

        if (job?.joblive === false) {
            toast.error('This job is closed');
            return;
        }

        if (!applyUrl) {
            toast.error('Application link not available');
            return;
        }

        openExternalLink(applyUrl);

        if (jobId) {
            await markJobAsApplied(jobId);
        }
    };

    /* ---------- LOADING / ERROR STATES ---------- */

    if (isLoading) {
        return (
            <main className="min-h-screen bg-[#08080A] pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-4 w-48 bg-white/5 rounded-md" />
                    <div className="flex gap-5 items-center">
                        <div className="w-20 h-20 bg-white/5 rounded-2xl" />
                        <div className="space-y-2 flex-1">
                            <div className="h-8 w-1/2 bg-white/5 rounded-md" />
                            <div className="h-4 w-1/4 bg-white/5 rounded-md" />
                        </div>
                    </div>
                    <div className="h-64 w-full bg-white/5 rounded-2xl" />
                </div>
            </main>
        );
    }

    if (error || !job) {
        return (
            <main className="min-h-screen bg-[#08080A] pt-32 px-6 flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold text-white mb-3">Job Not Found</h2>
                <p className="text-gray-400 mb-8 max-w-md">
                    {error || 'The job posting you are looking for does not exist or has been removed.'}
                </p>
                <button
                    onClick={() => navigate('/explore')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF4500] text-white font-medium hover:from-[#FF6610] hover:to-[#FF5500] transition-all cursor-pointer"
                >
                    Back to Find Jobs
                </button>
            </main>
        );
    }

    /* ---------- RENDER ---------- */

    return (
        <main className="min-h-screen bg-[#08080A] text-white pt-20 sm:pt-24 pb-24 relative overflow-hidden">
            {/* Ambient orange glows in background */}
            <div className="absolute left-0 top-32 w-[450px] h-[450px] rounded-full bg-[#FF5500]/[0.04] blur-[150px] pointer-events-none" />
            <div className="absolute right-0 top-48 w-[450px] h-[450px] rounded-full bg-[#FF5500]/[0.05] blur-[150px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400 mb-6">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                        title="Home"
                    >
                        <Home className="w-4 h-4 text-neutral-400 hover:text-white" />
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                    <button
                        type="button"
                        onClick={() => navigate('/explore')}
                        className="hover:text-white transition-colors cursor-pointer"
                    >
                        Find Jobs
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                    <span className="text-neutral-300 truncate max-w-[220px] sm:max-w-md">
                        {job.title}
                    </span>
                </nav>

                {/* Job Header Block */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-7">
                    <div className="flex items-start gap-4 sm:gap-5 min-w-0">
                        {/* Company Squircle Logo */}
                        <div className="p-1">
                            <CompanyLogo company={job.company} logo={job.logo} size="lg" />
                        </div>

                        {/* Title, Company & Metadata */}
                        <div className="space-y-2 min-w-0">
                            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-white tracking-tight leading-tight">
                                {job.title}
                            </h1>

                            <div className="flex items-center gap-2">
                                <span className="text-base font-semibold text-neutral-200">
                                    {job.company}
                                </span>
                                {applyUrl && (
                                    <button
                                        onClick={() => openExternalLink(applyUrl)}
                                        className="text-neutral-400 hover:text-[#FF5500] transition-colors cursor-pointer"
                                        title="View official career page"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Meta items row */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-neutral-400 pt-0.5">
                                {job.location && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                        <span>{job.location}</span>
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                    <span>{employmentType}</span>
                                </span>
                                {workplaceType && (
                                    <span className="flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                        <span>{workplaceType}</span>
                                    </span>
                                )}
                                {job.source && (
                                    <span className="flex items-center gap-1.5">
                                        <Globe className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                        <span className="capitalize">{job.source}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Top Right Actions: Bookmark & Share */}
                    <div className="flex items-center gap-2.5 self-start shrink-0">
                        <button
                            onClick={handleSave}
                            aria-label="Save Job"
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                                isSaved
                                    ? 'bg-orange-500/15 border-orange-500/50 text-[#FF5500]'
                                    : 'bg-[#121316] border-white/10 text-neutral-400 hover:text-white hover:border-white/25'
                            }`}
                        >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>

                        <button
                            onClick={handleShare}
                            aria-label="Share Job"
                            className="w-10 h-10 rounded-xl border bg-[#121316] border-white/10 text-neutral-400 hover:text-white hover:border-white/25 flex items-center justify-center transition-all cursor-pointer"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Skill & Department Pills */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-8">
                        {tags.map((tag, idx) => {
                            const isPrimary = idx === 0;
                            return (
                                <span
                                    key={idx}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                        isPrimary
                                            ? 'bg-[#24150D] border border-orange-500/40 text-[#FF6A26]'
                                            : 'bg-[#141519] border border-white/[0.08] text-neutral-300'
                                    }`}
                                >
                                    {tag}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Tabs Navigation */}
                <div className="border-b border-white/10 mb-8">
                    <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide">
                        {availableTabs.map((tab) => {
                            const isActive = activeTab === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative pb-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                        isActive ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
                                    }`}
                                >
                                    {tab}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5500] rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Applied Notice Banner */}
                {isApplied && (
                    <div className="mb-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-3.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-emerald-400 font-semibold text-sm">You applied for this job</p>
                            {appliedEntry?.appliedAt && (
                                <p className="text-emerald-400/70 text-xs">
                                    Applied on {formatDate(appliedEntry.appliedAt)}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Content & Sidebar Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
                    {/* LEFT COLUMN: Main Cards */}
                    <div className="space-y-6">
                        {/* Job Description Card */}
                        {activeTab === 'Overview' && (
                            <div className="bg-[#121316] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
                                <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
                                    Job Description
                                </h2>
                                <div
                                    className="text-neutral-300 text-sm sm:text-base leading-relaxed space-y-4"
                                    dangerouslySetInnerHTML={{
                                        __html: formatDescription(job.description, job.company)
                                    }}
                                />

                                {/* Bottom Metadata Strip inside card */}
                                <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-sm text-neutral-400">
                                    <span className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-neutral-400" />
                                        <span>{employmentType}</span>
                                    </span>
                                    {workplaceType && (
                                        <span className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-neutral-400" />
                                            <span>{workplaceType}</span>
                                        </span>
                                    )}
                                    {job.location && (
                                        <span className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-neutral-400" />
                                            <span>{job.location}</span>
                                        </span>
                                    )}
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-neutral-400" />
                                        <span>Posted on {postedDate}</span>
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Responsibilities Section Card */}
                        {activeTab === 'Responsibilities' && (
                            <div className="bg-[#121316] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
                                <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
                                    Responsibilities
                                </h2>
                                <ul className="space-y-3 text-sm sm:text-base text-neutral-300">
                                    {responsibilities.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] mt-2 shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Requirements Section Card */}
                        {activeTab === 'Requirements' && (
                            <div className="bg-[#121316] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
                                <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
                                    Requirements
                                </h2>
                                <ul className="space-y-3 text-sm sm:text-base text-neutral-300">
                                    {requirements.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] mt-2 shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Sidebar Cards */}
                    <div className="space-y-6 lg:sticky lg:top-24">
                        {/* Company Card */}
                        <div className="bg-[#121316] border border-white/[0.08] rounded-2xl p-6 space-y-5">
                            <div
                                onClick={() => navigate('/companies')}
                                className="flex items-center justify-between group cursor-pointer"
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <CompanyLogo company={job.company} logo={job.logo} size="sm" />
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-white text-base leading-tight group-hover:text-[#FF5500] transition-colors truncate">
                                            {job.company}
                                        </h3>
                                        {companyTagline && (
                                            <p className="text-xs text-neutral-400 mt-0.5 truncate">
                                                {companyTagline}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                            </div>

                            {(companySize || companyIndustry || companyHq) && (
                                <div className="space-y-3 text-xs sm:text-sm text-neutral-300 pt-1 border-t border-white/[0.06]">
                                    {companySize && (
                                        <div className="flex items-center gap-2.5 text-neutral-400">
                                            <Users className="w-4 h-4 text-neutral-400 shrink-0" />
                                            <span>{companySize}</span>
                                        </div>
                                    )}
                                    {companyIndustry && (
                                        <div className="flex items-center gap-2.5 text-neutral-400">
                                            <Globe className="w-4 h-4 text-neutral-400 shrink-0" />
                                            <span>{companyIndustry}</span>
                                        </div>
                                    )}
                                    {companyHq && (
                                        <div className="flex items-center gap-2.5 text-neutral-400">
                                            <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                                            <span>{companyHq}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-2 border-t border-white/[0.06]">
                                <button
                                    onClick={() => navigate('/companies')}
                                    className="text-sm font-semibold text-[#FF5500] hover:text-[#FF6610] flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    View Company <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Apply & Save Action Card */}
                        <div className="bg-[#121316] border border-white/[0.08] rounded-2xl p-6 space-y-3.5">
                            <button
                                onClick={handleApply}
                                disabled={job.joblive === false}
                                className="w-full h-12 rounded-xl text-white font-semibold text-[15px] bg-gradient-to-r from-[#FF5500] to-[#FF4500] hover:from-[#FF6610] hover:to-[#FF5500] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_-2px_rgba(255,85,0,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {job.joblive === false ? (
                                    'Closed'
                                ) : isApplied ? (
                                    <>Applied ✓</>
                                ) : (
                                    <>
                                        Apply Now
                                        <ArrowUpRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleSave}
                                className={`w-full h-12 rounded-xl font-medium text-[14px] border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                    isSaved
                                        ? 'bg-orange-500/10 border-orange-500/40 text-[#FF5500]'
                                        : 'bg-transparent border-white/15 text-white hover:bg-white/[0.04] hover:border-white/25'
                                }`}
                            >
                                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                                {isSaved ? 'Saved' : 'Save Job'}
                            </button>

                            <p className="text-center text-xs text-neutral-500 pt-1">
                                Posted on {postedDate}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};
