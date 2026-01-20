import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';
import { jobs as jobApi } from '../services/api';

// LocalStorage keys for tracking job count
const LAST_JOB_COUNT_KEY = 'lumina_last_job_count';
const LAST_CHECK_DATE_KEY = 'lumina_last_check_date';

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [newJobsCount, setNewJobsCount] = useState<number | null>(null);

  useEffect(() => {
    const calculateNewJobs = async () => {
      try {
        // Fetch current total jobs count from API
        const response = await jobApi.getAll(1, 1);
        const currentTotal = response.pagination?.totalJobs || 0;

        // Get stored previous count and date
        const storedCount = localStorage.getItem(LAST_JOB_COUNT_KEY);
        const storedDate = localStorage.getItem(LAST_CHECK_DATE_KEY);
        const today = new Date().toDateString();

        let diff = 0;

        if (storedCount && storedDate) {
          const previousCount = parseInt(storedCount, 10);

          if (storedDate === today) {
            // Same day - show the difference from start of day
            diff = currentTotal - previousCount;
          } else {
            // New day - calculate diff from yesterday's count, then store new baseline
            diff = currentTotal - previousCount;

            // Only update the baseline if it's a new day
            localStorage.setItem(LAST_JOB_COUNT_KEY, String(currentTotal));
            localStorage.setItem(LAST_CHECK_DATE_KEY, today);
          }
        } else {
          // First visit - store current count as baseline
          localStorage.setItem(LAST_JOB_COUNT_KEY, String(currentTotal));
          localStorage.setItem(LAST_CHECK_DATE_KEY, today);
          diff = 0; // No previous data to compare
        }

        // Ensure positive number (in case jobs were removed)
        setNewJobsCount(Math.max(0, diff));
      } catch (error) {
        console.error('Failed to calculate new jobs count', error);
        setNewJobsCount(0);
      }
    };

    calculateNewJobs();
  }, []);

  // Format the display text
  const getNewJobsText = () => {
    if (newJobsCount === null) return 'Loading...';
    if (newJobsCount === 0) return 'Fresh Jobs Updated Daily';
    if (newJobsCount >= 100) return `${newJobsCount}+ New Roles Added Today`;
    return `${newJobsCount} New Roles Added Today`;
  };

  return (
    <section className="relative pt-24 pb-16 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Ambience - constrained to prevent overflow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[300px] md:h-[500px] bg-accent/20 blur-[120px] rounded-full opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[50vw] max-w-[800px] h-[400px] md:h-[600px] bg-blue-500/10 blur-[100px] rounded-full opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left: Hook & Value Prop */}
        <div className="flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs font-medium text-gray-300 mb-8 animate-fade-in-up">
            <span className={`w-2 h-2 rounded-full ${newJobsCount && newJobsCount > 0 ? 'bg-green-500' : 'bg-accent'} animate-pulse`} />
            {getNewJobsText()}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.15] mb-4 md:mb-6">
            Find and apply to{' '}
            <span className="text-gradient-accent">all relevant jobs</span> in one place.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 md:mb-8 max-w-lg leading-relaxed">
            Stop visiting fifty different career pages. Access direct company listings, use one-click applications, and see fresh opportunities dropped daily.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/jobs')}>
              Start Applying Now <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => navigate('/jobs')}>
              View Open Roles
            </Button>
          </div>

          {/* Value Prop Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full pt-8 border-t border-white/5">
            <div className="flex items-start gap-3 group">
              <CheckCircle2 className="w-5 h-5 text-gray-500 group-hover:text-accent transition-colors mt-0.5" />
              <div>
                <h3 className="font-semibold text-white mb-1">Direct Applications</h3>
                <p className="text-sm text-gray-500">Apply directly to the source. No third-party recruiters.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 group">
              <CheckCircle2 className="w-5 h-5 text-gray-500 group-hover:text-accent transition-colors mt-0.5" />
              <div>
                <h3 className="font-semibold text-white mb-1">One-Click Apply</h3>
                <p className="text-sm text-gray-500">Fill your profile once. Apply everywhere instantly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Abstract Visual / Interactive */}
        <div className="relative h-[400px] w-full hidden lg:flex items-center justify-center">
          {/* Abstract floating cards effect */}
          <div className="absolute w-64 h-80 bg-surface border border-white/10 rounded-2xl shadow-2xl rotate-[-6deg] z-10 p-6 flex flex-col justify-between animate-float" style={{ animationDelay: '0s' }}>
            <div className="w-12 h-12 rounded-lg bg-white/10 mb-4" />
            <div className="space-y-3">
              <div className="h-2 w-3/4 bg-white/20 rounded" />
              <div className="h-2 w-1/2 bg-white/10 rounded" />
            </div>
          </div>

          <div className="absolute w-64 h-80 bg-surface border border-white/10 rounded-2xl shadow-2xl rotate-[6deg] z-20 translate-x-8 translate-y-12 p-6 flex flex-col justify-between animate-float backdrop-blur-xl bg-opacity-90" style={{ animationDelay: '1s' }}>
            <div className="w-12 h-12 rounded-lg bg-accent/20 mb-4 flex items-center justify-center">
              <div className="w-6 h-6 bg-accent rounded-full" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-3/4 bg-white rounded" />
              <div className="h-2 w-full bg-white/20 rounded" />
              <div className="h-2 w-1/2 bg-white/20 rounded" />
            </div>
            <div className="mt-auto pt-4 flex justify-between items-center border-t border-white/10">
              <span className="text-xs text-gray-400">Just now</span>
              <span className="text-xs font-mono text-accent">APPLICATION_SENT</span>
            </div>
          </div>

          {/* Grid behind visuals */}
          <div className="absolute inset-0 bg-grid opacity-30 mask-radial" />
        </div>
      </div>
    </section>
  );
};