import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Job } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { MapPin, Clock, Building, Briefcase, ArrowLeft, ArrowUpRight, Heart, Globe, Calendar, Tag, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobs as jobApi } from '../../services/api';
import { getCompanyIcon } from '../CompanyLogos';
import { formatDescription } from '../../utils/formatJobDescription.ts';
import { openExternalLink } from '../../utils/security';


// Helper function to format dates nicely
const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
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
    const [isExpanded, setIsExpanded] = useState(false);

    const isSaved = id ? isJobSaved(id) : false;
    const isApplied = user?.appliedJobs?.some(a => a.jobId === id) || false;

    const handleToggleSave = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (id) toggleSaveJob(id);
    };

    useEffect(() => {
        const fetchJob = async () => {
            setIsLoading(true);
            setError(null);
            try {
                if (id) {
                    const data = await jobApi.getOne(id);
                    // console.log('Fetched job data:', data);
                    if (data && typeof data === 'object') {
                        setJob(data);
                    } else {
                        setError('Job data not found');
                    }
                }
            } catch (err: any) {
                console.error("Failed to fetch job details", err);
                setError(err.message || 'Failed to fetch job details');
            } finally {
                setIsLoading(false);
            }
        };
        fetchJob();
    }, [id]);

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
                    {error || 'The job posting you are looking for does not exist or has been removed.'}
                </p>
                <Button onClick={() => navigate(-1)}>Back to Jobs</Button>
            </main>
        );
    }

    // Get the apply URL (handle both field names)
    const applyUrl = job.apply_url || job.applyUrl || '#';

    // Get employment type (handle both field names)
    const employmentType = job.employment_type || job.type || 'Not specified';

    // Get posted date
    const postedDate = formatDate(job.createdAt || job.postedAt);

    const handleAction = async (actionType: 'apply' | 'save') => {
        if (!user) {
            navigate('/login', {
                state: {
                    message: "You need to be logged in to continue",
                    returnUrl: window.location.pathname
                }
            });
            return;
        }

        if (actionType === 'apply') {
            openExternalLink(applyUrl);
            if (job._id || id) {
                // Mark as applied AFTER redirecting
                await markJobAsApplied((job._id || id) as string);
                // toast.success('Job marked as applied!'); 
            }
        } else if (actionType === 'save') {
            if (job._id) toggleSaveJob(job._id);
        }
    };

    return (
        <main className="pt-24 min-h-screen px-3 sm:px-6 pb-24">
            <div className="max-w-4xl mx-auto">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Jobs</span>
                    </button>

                    <button
                        onClick={handleToggleSave}
                        className={`p-3 rounded-full border transition-all ${isSaved ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-surface border-white/10 text-gray-400 hover:text-white hover:border-white/30'}`}
                        title={isSaved ? "Unsave Job" : "Save Job"}
                    >
                        <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                </div>

                <div className="grid md:grid-cols-[1fr_300px] gap-8 items-start">
                    {/* Main Content */}
                    <div className="space-y-8">
                        {/* Title and Company */}
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{job.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-lg text-gray-400">
                                <span className="flex items-center gap-2">
                                    <Building className="w-5 h-5" /> {job.company}
                                </span>
                                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                                <span className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" /> {job.location}
                                </span>
                            </div>
                        </div>

                        {/* Metadata Badges */}

                        {/* CLOSED JOB WARNING */}
                        {job.joblive === false && (
                            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 mb-6">
                                <div className="p-2 bg-red-500/20 rounded-full">
                                    <Clock className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-400">Position Closed</h3>
                                    <p className="text-sm text-gray-400">This job is no longer accepting applications.</p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                            {/* Employment Type */}
                            <div className="px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-sm flex items-center gap-2 text-accent">
                                <Briefcase className="w-4 h-4" /> {employmentType}
                            </div>

                            {/* Experience */}
                            {job.experience && (
                                <div className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-sm flex items-center gap-2 text-green-400">
                                    <Clock className="w-4 h-4" /> {job.experience}
                                </div>
                            )}

                            {/* Job Type (job/internship) */}
                            {job.job_type && (
                                <div className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-sm flex items-center gap-2 text-purple-400">
                                    <Tag className="w-4 h-4" /> {job.job_type.charAt(0).toUpperCase() + job.job_type.slice(1)}
                                </div>
                            )}

                            {/* Source */}
                            {job.source && (
                                <div className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-sm flex items-center gap-2 text-blue-400">
                                    <Globe className="w-4 h-4" /> {job.source}
                                </div>
                            )}

                            {/* Department */}
                            {job.department && (
                                <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm flex items-center gap-2 text-gray-300">
                                    {job.department}
                                </div>
                            )}
                        </div>

                        {/* Job Description */}
                        <Card className="p-4 md:p-8 bg-surface/50 border-white/5 relative">
                            <h3 className="text-xl font-bold mb-6">Job Description</h3>
                            <div
                                className={`prose prose-invert prose-p:text-gray-400 prose-p:leading-relaxed prose-headings:text-white max-w-none space-y-4 whitespace-pre-line ${!isExpanded ? 'max-h-[140px] overflow-hidden md:max-h-none md:overflow-visible' : ''
                                    }`}
                                dangerouslySetInnerHTML={{ __html: formatDescription(job.description) }}
                            />

                            {/* Mobile Expand Gradient & Button */}
                            {!isExpanded && (
                                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent md:hidden flex flex-col justify-end pb-4 items-center">
                                    <button
                                        onClick={() => setIsExpanded(true)}
                                        className="bg-surface border border-white/10 px-4 py-2 rounded-full text-sm font-medium text-white shadow-lg hover:bg-surface-hover transition-colors flex items-center gap-2"
                                    >
                                        Show full job details <div className="w-2 h-2 border-r border-b border-white rotate-45 mt-[-2px]"></div>
                                    </button>
                                </div>
                            )}
                        </Card>

                        {/* Mobile Apply Button */}
                        <div className="flex flex-col gap-4 md:hidden">
                            <Button
                                onClick={() => handleAction('apply')}
                                className={`w-full flex items-center justify-center gap-2 ${isApplied ? 'text-green-500 border-green-500 hover:bg-green-500/10' : ''}`}
                                size="lg"
                                disabled={job.joblive === false}
                                variant={isApplied ? 'outline' : 'default'}
                            >
                                {job.joblive === false ? 'Closed' : isApplied ? 'Apply Again' : 'Apply Now'} <ArrowUpRight className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Desktop Bottom Apply Section */}
                        <div className="hidden md:block">
                            <h3 className="text-xl font-bold mb-4">Ready to apply?</h3>
                            <Button
                                className={`flex items-center justify-center gap-2 ${isApplied ? 'text-green-500 border-green-500 hover:bg-green-500/10' : ''}`}
                                onClick={() => handleAction('apply')}
                                size="lg"
                                disabled={job.joblive === false}
                                variant={isApplied ? 'outline' : 'default'}
                            >
                                {job.joblive === false ? 'Applications Closed' : isApplied ? 'Applied' : 'Apply for this Role'} <ArrowUpRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Sticky Sidebar */}
                    <div className="md:sticky md:top-32 space-y-6">
                        <Card className="p-6 bg-surface border-white/10 space-y-6">
                            {/* Company Info */}
                            <div className="flex items-center gap-4">
                                {(() => {
                                    const customIcon = getCompanyIcon(job.company, 64);
                                    if (customIcon) {
                                        return <div className="w-16 h-16 rounded-xl flex items-center justify-center">{customIcon}</div>;
                                    }
                                    if (job.logo) {
                                        return <img src={job.logo} alt={job.company} width={64} height={64} className="w-16 h-16 rounded-xl object-cover bg-white" />;
                                    }
                                    return (
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                            {job.company?.charAt(0) || 'J'}
                                        </div>
                                    );
                                })()}
                                <div>
                                    <h3 className="font-bold text-lg">{job.company}</h3>
                                    <p className="text-sm text-gray-400">{job.location}</p>
                                </div>
                            </div>

                            {/* Job Details */}
                            <div className="border-t border-white/10 pt-6 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Posted
                                    </span>
                                    <span>{postedDate}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400 flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Type
                                    </span>
                                    <span>{employmentType}</span>
                                </div>

                                {job.source && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400 flex items-center gap-2">
                                            <Globe className="w-4 h-4" /> Source
                                        </span>
                                        <span>{job.source}</span>
                                    </div>
                                )}

                                {job._id && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Job ID</span>
                                        <span className="font-mono text-xs text-gray-500 truncate max-w-[120px]" title={job._id}>
                                            {job._id}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Apply Button */}
                            {/* Apply Button */}
                            <Button
                                className={`w-full flex items-center justify-center gap-2 ${isApplied ? 'text-green-500 border-green-500 hover:bg-green-500/10' : ''}`}
                                disabled={job.joblive === false}
                                onClick={() => handleAction('apply')}
                                variant={isApplied ? 'outline' : 'default'}
                            >
                                {job.joblive === false ? 'Closed' : isApplied ? 'Applied' : 'Apply Now'} <ArrowUpRight className="w-4 h-4" />
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
};
