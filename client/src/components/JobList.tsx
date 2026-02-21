import React from 'react';
import { Job } from '../types';
import { Button } from './ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { JobCard } from './JobCard';

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
              <JobCard key={job._id || job.id} job={job} />
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