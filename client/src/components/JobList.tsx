import React from 'react';
import { Job } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { MapPin, Clock, DollarSign, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCompanyIcon } from './CompanyLogos';
import { formatTimeAgo } from '../utils/formatDate';
import { openExternalLink } from '../utils/security';

interface JobListProps {
  jobs: Job[];
  isLoading?: boolean;
  showViewAll?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

// Helper to render company logo - uses custom icon for known companies
const CompanyLogo: React.FC<{ company: string; logo?: string }> = ({ company, logo }) => {
  const [imgError, setImgError] = React.useState(false);
  // Use smaller size on mobile via responsive classes
  const customIcon = getCompanyIcon(company, 40);
  const logoDevKey = import.meta.env.VITE_LOGO_DEV_PUBLIC_KEY;

  if (customIcon) {
    return <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0">{customIcon}</div>;
  }

  // Try Logo.dev first (or provided logo if we prefer). 
  // Given the request, I'll use logo.dev.
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

  // Fallback to provided logo if logo.dev fails
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

export const JobList: React.FC<JobListProps> = ({
  jobs,
  isLoading = false,
  showViewAll = false,
  pagination
}) => {
  const navigate = useNavigate();
  return (
    <section id="jobs" className="py-12 sm:py-24 relative bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Apply to these roles</h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-2xl">
              Direct applications available now. No third-party recruiters.
            </p>
          </div>
          {showViewAll && <Button variant="outline" size="sm" className="w-fit" onClick={() => navigate('/jobs')}>View All Positions</Button>}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="min-h-[220px] sm:min-h-[260px] rounded-xl bg-surface/50 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.isArray(jobs) && jobs.map((job) => (
              <Card
                key={job._id || job.id}
                className="p-4 sm:p-6 group flex flex-col h-full bg-surface/50 hover:bg-surface transition-colors cursor-pointer"
                onClick={(e) => {
                  const jobUrl = `/jobs/${job._id || job.id}`;
                  if (e.ctrlKey || e.metaKey) {
                    openExternalLink(jobUrl);
                  } else {
                    navigate(jobUrl);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-4 sm:mb-6 gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <CompanyLogo company={job.company} logo={job.logo} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-white group-hover:text-accent transition-colors text-sm sm:text-base leading-tight line-clamp-2">{job.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{job.company}</p>
                    </div>
                  </div>
                  <div className="p-1.5 sm:p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300 flex-shrink-0 hidden sm:block">
                    <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>

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
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex items-center gap-1">
              {(() => {
                const { currentPage, totalPages } = pagination;
                const pages: (number | string)[] = [];

                // On mobile, show fewer page buttons
                const maxButtons = window.innerWidth < 640 ? 5 : 7;

                if (totalPages <= maxButtons) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);

                  if (currentPage > 3) {
                    pages.push('...');
                  }

                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);

                  for (let i = start; i <= end; i++) {
                    if (!pages.includes(i)) pages.push(i);
                  }

                  if (currentPage < totalPages - 2) {
                    pages.push('...');
                  }

                  if (totalPages > 1) pages.push(totalPages);
                }

                return pages.map((page, idx) => (
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center text-gray-500 text-sm">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => pagination.onPageChange(page as number)}
                      className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg flex items-center justify-center transition-colors text-sm sm:text-base ${currentPage === page
                        ? 'bg-accent text-white font-bold'
                        : 'bg-surface hover:bg-surface/80 text-gray-400 hover:text-white'
                        }`}
                    >
                      {page}
                    </button>
                  )
                ));
              })()}
            </div>

            <Button
              variant="outline"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};