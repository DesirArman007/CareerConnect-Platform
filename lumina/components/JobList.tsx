import React from 'react';
import { Job } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { MapPin, Clock, DollarSign, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCompanyIcon } from './CompanyLogos';

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
  const customIcon = getCompanyIcon(company, 48);

  if (customIcon) {
    return <div className="w-12 h-12 rounded-lg flex items-center justify-center">{customIcon}</div>;
  }

  if (logo) {
    return <img src={logo} alt={company} className="w-12 h-12 rounded-lg bg-white/5 object-cover" />;
  }

  // Fallback: gradient with first letter
  return (
    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-white font-bold text-lg">
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
    <section id="jobs" className="py-24 relative bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Apply to these roles</h2>
            <p className="text-gray-400 max-w-2xl">
              Direct applications available now. No third-party recruiters.
            </p>
          </div>
          {showViewAll && <Button variant="outline" onClick={() => navigate('/jobs')}>View All Positions</Button>}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-surface/50 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(jobs) && jobs.map((job) => (
              <Card
                key={job._id || job.id}
                className="p-6 group flex flex-col h-full bg-surface/50 hover:bg-surface transition-colors cursor-pointer"
                onClick={() => navigate(`/jobs/${job._id || job.id}`)}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <CompanyLogo company={job.company} logo={job.logo} />
                    <div>
                      <h3 className="font-bold text-white group-hover:text-accent transition-colors">{job.title}</h3>
                      <p className="text-sm text-gray-500">{job.company}</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {job.tags && Array.isArray(job.tags) && job.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-400 border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto space-y-3 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4" /> {job.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" /> {job.employment_type || job.type || 'Full-time'}
                    </div>
                    <span className="text-xs text-gray-600 font-mono">{job.postedAt}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>

            <div className="flex items-center gap-1">
              {(() => {
                const { currentPage, totalPages } = pagination;
                const pages: (number | string)[] = [];

                // Always show max 7 buttons: first, last, current, and neighbors
                if (totalPages <= 7) {
                  // Show all pages if 7 or fewer
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  // Smart pagination with ellipsis
                  pages.push(1); // Always show first

                  if (currentPage > 3) {
                    pages.push('...');
                  }

                  // Pages around current
                  const start = Math.max(2, currentPage - 1);
                  const end = Math.min(totalPages - 1, currentPage + 1);

                  for (let i = start; i <= end; i++) {
                    if (!pages.includes(i)) pages.push(i);
                  }

                  if (currentPage < totalPages - 2) {
                    pages.push('...');
                  }

                  pages.push(totalPages); // Always show last
                }

                return pages.map((page, idx) => (
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-500">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => pagination.onPageChange(page as number)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${currentPage === page
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
              className="flex items-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};