import React from 'react';
import { Job } from '../types';
import { MapPin, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatTimeAgo } from '../utils/formatDate';
import { openExternalLink } from '../utils/security';
import { CompanyLogo } from './CompanyLogo';

interface JobCardProps {
    job: Job;
    variant?: 'default' | 'saved' | 'applied';
    appliedDate?: string;
    onRemove?: (e: React.MouseEvent) => void;
    className?: string;
}

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

    const employmentType = job.employment_type || job.type || 'Full-time';
    const postedTime = job.createdAt ? formatTimeAgo(job.createdAt) : (job.postedAt || '');

    return (
        <div
            className={`group relative flex flex-col h-full justify-between bg-[#0B0F12] border border-white/[0.08] hover:border-white/[0.18] hover:bg-[#0E1317] rounded-[22px] sm:rounded-[24px] p-5 sm:p-6 transition-all duration-200 cursor-pointer ${className || ''}`}
            onClick={handleClick}
        >
            {/* Top Row: Squircle Logo + Title/Company */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                    <CompanyLogo company={job.company} logo={job.logo} />
                    <div className="min-w-0 flex-1 pt-0.5">
                        <h3 className="font-bold text-white text-[15px] sm:text-[16px] leading-snug line-clamp-2 tracking-tight group-hover:text-white transition-colors">
                            {job.title}
                        </h3>
                        <p className="text-xs sm:text-[13.5px] text-[#7E8B9B] font-normal mt-0.5 truncate">
                            {job.company}
                        </p>
                    </div>
                </div>

                {/* Actions (if saved or applied) */}
                {variant === 'saved' && (
                    <button
                        onClick={handleRemove}
                        className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors z-10 flex-shrink-0"
                        title="Remove from saved jobs"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Applied Date indicator for dashboard if applied */}
            {variant === 'applied' && appliedDate && (
                <div className="mt-2 text-right">
                    <span className="text-xs text-emerald-400 font-medium">
                        Applied {new Date(appliedDate).toLocaleDateString()}
                    </span>
                </div>
            )}

            {/* Subtle Divider Line */}
            <div className="border-t border-white/[0.08] my-4 sm:my-5 mt-auto" />

            {/* Bottom Row: Location | Employment Type (Left) & Posted Time (Right) */}
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 sm:gap-3.5 text-[#94A3B8]">
                    {/* Location */}
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#7E8B9B] flex-shrink-0" />
                        <span className="text-[13.5px] sm:text-sm text-[#94A3B8] font-normal">
                            {job.location || 'Location not specified'}
                        </span>
                    </div>

                    {/* Vertical Divider */}
                    <span className="h-3.5 w-px bg-white/[0.12] flex-shrink-0" />

                    {/* Employment Type */}
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#7E8B9B] flex-shrink-0" />
                        <span className="text-[13.5px] sm:text-sm text-[#94A3B8] font-normal">
                            {employmentType}
                        </span>
                    </div>
                </div>

                {/* Posted Time */}
                {postedTime && (
                    <span className="text-[13px] sm:text-sm text-[#64748B] font-normal ml-auto whitespace-nowrap">
                        {postedTime}
                    </span>
                )}
            </div>
        </div>
    );
};

export default JobCard;
