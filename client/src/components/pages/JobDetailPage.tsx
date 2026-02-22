import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Job } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
    MapPin,
    Clock,
    Building,
    Briefcase,
    ArrowLeft,
    ArrowUpRight,
    Heart,
    Globe,
    Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobApi } from '../../services/jobs.api';
import { formatDescription } from '../../utils/formatJobDescription';
import { openExternalLink } from '../../utils/security';

/* ---------- HELPERS ---------- */

const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
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

export const JobDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const { user, toggleSaveJob, isJobSaved, markJobAsApplied } = useAuth();

    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imgError, setImgError] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

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

                setJob(response.data.job);
            } catch (err: any) {
                console.error('Failed to fetch job details', err);
                setError(err.message || 'Failed to fetch job details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJob();
    }, [id]);

    /* ---------- LOADING / ERROR ---------- */

    if (isLoading) {
        return (
            <main className="pt-32 min-h-screen px-6 max-w-4xl mx-auto">
                <div className="animate-pulse space-y-8">
                    <div className="h-8 w-32 bg-white/5 rounded"></div>
                    <div className="h-16 w-3/4 bg-white/5 rounded"></div>
                    <div className="h-64 w-full bg-white/5 rounded"></div>
                </div>
            </main>
        );
    }

    if (error || !job) {
        return (
            <main className="pt-32 min-h-screen px-6 flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
                <p className="text-gray-400 mb-8">
                    {error || 'The job posting you are looking for does not exist.'}
                </p>
                <Button onClick={() => navigate(-1)}>Back to Jobs</Button>
            </main>
        );
    }

    /* ---------- NORMALIZED FIELDS ---------- */

    const jobId = job.id;
    const applyUrl = job.apply_url ?? null;
    const employmentType = job.employment_type ?? 'Not specified';
    const postedDate = formatDate(job.createdAt);

    const isSaved = jobId ? isJobSaved(jobId) : false;
    const appliedEntry = user?.appliedJobs?.find(a => a.jobId === jobId);
    const isApplied = !!appliedEntry;

    /* ---------- ACTIONS ---------- */

    const requireAuth = () => {
        navigate('/login', {
            state: {
                message: 'You need to be logged in to continue',
                returnUrl: location.pathname
            }
        });
    };

    const handleSave = () => {
        if (!user) return requireAuth();
        if (jobId) toggleSaveJob(jobId);
    };

    const handleApply = async () => {
        if (!user) return requireAuth();

        if (job.joblive === false) {
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

    /* ---------- RENDER ---------- */

    return (
        <main className="pt-24 min-h-screen px-3 sm:px-6 pb-24">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Jobs
                    </button>

                    <button
                        onClick={handleSave}
                        className={`p-3 rounded-full border ${isSaved
                            ? 'bg-red-500/10 border-red-500/50 text-red-500'
                            : 'border-white/10 text-gray-400 hover:text-white'
                            }`}
                    >
                        <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                </div>

                <div className="grid md:grid-cols-[1fr_300px] gap-8">
                    {/* MAIN */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                {job.title}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-gray-400">
                                <span className="flex items-center gap-2">
                                    <Building className="w-5 h-5" /> {job.company}
                                </span>
                                <span className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" /> {job.location}
                                </span>
                            </div>
                        </div>

                        {/* APPLIED BANNER */}
                        {isApplied && (
                            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <span className="text-green-400 text-lg">✓</span>
                                </div>
                                <div>
                                    <p className="text-green-400 font-semibold text-sm">You applied for this job</p>
                                    {appliedEntry?.appliedAt && (
                                        <p className="text-green-400/70 text-xs">
                                            Applied on {formatDate(appliedEntry.appliedAt)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                            <div className="badge">
                                <Briefcase className="w-4 h-4" /> {employmentType}
                            </div>
                            {job.source && (
                                <div className="badge">
                                    <Globe className="w-4 h-4" /> {job.source}
                                </div>
                            )}
                        </div>

                        <Card className="p-6 relative">
                            <h3 className="text-xl font-bold mb-4">Job Description</h3>
                            <div
                                className={`prose prose-invert ${!isExpanded ? 'max-h-[160px] overflow-hidden' : ''
                                    }`}
                                dangerouslySetInnerHTML={{
                                    __html: formatDescription(job.description)
                                }}
                            />
                            {!isExpanded && (
                                <button
                                    onClick={() => setIsExpanded(true)}
                                    className="mt-4 text-accent"
                                >
                                    Show full description
                                </button>
                            )}
                        </Card>

                        <Button
                            size="lg"
                            onClick={handleApply}
                            disabled={job.joblive === false}
                            variant={isApplied ? 'outline' : 'secondary'}
                            className={isApplied ? 'text-green-500 border-green-500' : ''}
                        >
                            {job.joblive === false
                                ? 'Closed'
                                : isApplied
                                    ? 'Applied'
                                    : 'Apply Now'}{' '}
                            <ArrowUpRight className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* SIDEBAR */}
                    <div className="md:sticky md:top-32">
                        <Card className="p-6 space-y-6">
                            <div className="flex gap-4 items-center">
                                {!imgError && import.meta.env.VITE_LOGO_DEV_PUBLIC_KEY ? (
                                    <img
                                        src={`https://img.logo.dev/name/${encodeURIComponent(job.company)}?token=${import.meta.env.VITE_LOGO_DEV_PUBLIC_KEY}&format=png`}
                                        alt={job.company}
                                        className="w-12 h-12 object-contain flex-shrink-0 rounded-lg"
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-accent flex items-center justify-center">
                                        <span className="text-lg font-bold text-white">
                                            {job.company?.[0]}
                                        </span>
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h3 className="font-bold truncate">{job.company}</h3>
                                    <p className="text-sm text-gray-400 truncate">{job.location}</p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Posted
                                    </span>
                                    <span>{postedDate}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleApply}
                                disabled={job.joblive === false}
                                variant={isApplied ? 'outline' : 'secondary'}
                                className={isApplied ? 'text-green-500 border-green-500' : ''}
                            >
                                {job.joblive === false
                                    ? 'Closed'
                                    : isApplied
                                        ? 'Applied'
                                        : 'Apply Now'}{' '}
                                <ArrowUpRight className="w-4 h-4" />
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
};
