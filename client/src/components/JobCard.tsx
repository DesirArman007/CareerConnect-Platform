import React from 'react';
import { Job } from '../types';
import { Card } from './ui/Card';
import { MapPin, Clock, ArrowUpRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCompanyIcon } from './CompanyLogos';
import { formatTimeAgo } from '../utils/formatDate';
import { openExternalLink } from '../utils/security';

interface JobCardProps {
    job: Job;
    variant?: 'default' | 'saved' | 'applied';
    appliedDate?: string;
    onRemove?: (e: React.MouseEvent) => void;
    className?: string;
}

// Helper to render company logo - reused from JobList
const CompanyLogo: React.FC<{ company: string; logo?: string }> = ({ company, logo }) => {
    const [imgError, setImgError] = React.useState(false);
    // Use smaller size on mobile via responsive classes
    const customIcon = getCompanyIcon(company, 40);
    const logoDevKey = import.meta.env.VITE_LOGO_DEV_PUBLIC_KEY;

    if (customIcon) {
        return <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0">{customIcon}</div>;
    }

    // Try Logo.dev first
    if (!imgError && logoDevKey) {
        return (
            <img
                src={`https://img.logo.dev/name/${encodeURIComponent(company)}?token=${logoDevKey}`}
                alt={company}
                width={40}
                height={40}
                onError={() => setImgError(true)}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/5 object-cover flex-shrink-0"
            />
        );
    }

    // Fallback to provided logo
    if (logo) {
        return <img src={logo} alt={company} width={40} height={40} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/5 object-cover flex-shrink-0" />;
    }

    // Final Fallback: gradient with first letter
    return (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
            {company?.charAt(0) || 'J'}
        </div>
    );
};

export const JobCard: React.FC<JobCardProps> = ({
    job,
    variant = 'default',
    appliedDate,
    onRemove,
    className
}) => {
    const navigate = useNavigate();

    const handleClick = (e: React.MouseEvent) => {
        const jobUrl = `/jobs/${job.id}`;
        if (e.ctrlKey || e.metaKey) {
            openExternalLink(jobUrl);
        } else {
            navigate(jobUrl);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove?.(e);
    };

    return (
        <Card
            className={`p-4 sm:p-6 group flex flex-col h-full bg-surface/50 hover:bg-surface transition-colors cursor-pointer relative ${className || ''}`}
            onClick={handleClick}
        >
            <div className="flex items-start justify-between mb-4 sm:mb-6 gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <CompanyLogo company={job.company} logo={job.logo} />
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-white group-hover:text-accent transition-colors text-sm sm:text-base leading-tight line-clamp-2">{job.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{job.company}</p>
                    </div>
                </div>

                {/* ACTION BUTTONS / BADGES */}
                <div className="flex items-center gap-2">
                    {variant === 'saved' && (
                        <button
                            onClick={handleRemove}
                            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-red-500 transition-colors z-10"
                            title="Remove from saved jobs"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}

                    {variant === 'applied' && appliedDate && (
                        <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded whitespace-nowrap hidden sm:inline-block">
                            Applied {new Date(appliedDate).toLocaleDateString()}
                        </span>
                    )}

                    {variant === 'default' && (
                        <div className="p-1.5 sm:p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300 flex-shrink-0 hidden sm:block">
                            <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Applied Badge */}
            {variant === 'applied' && appliedDate && (
                <div className="sm:hidden mb-3">
                    <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded">
                        Applied {new Date(appliedDate).toLocaleDateString()}
                    </span>
                </div>
            )}

            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                {job.tags && Array.isArray(job.tags) && job.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-400 border border-white/5">
                        {tag}
                    </span>
                ))}
                {job.tags && job.tags.length > 3 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-500 border border-white/5">
                        +{job.tags.length - 3}
                    </span>
                )}
            </div>

            <div className="mt-auto space-y-2 sm:space-y-3 pt-4 sm:pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{job.location}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> {job.employment_type || job.type || 'Full-time'}
                    </div>
                    <span className="text-xs text-gray-600 font-mono">
                        {job.createdAt ? formatTimeAgo(job.createdAt) : job.postedAt}
                    </span>
                </div>
            </div>
        </Card>
    );
};
