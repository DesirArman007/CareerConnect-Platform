import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';

export const CTA: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-accent/5" />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 md:mb-6">
          Stop searching. <br />
          <span className="text-gradient-accent">Start applying.</span>
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-400 mb-6 md:mb-10 max-w-2xl mx-auto leading-relaxed">
          Everything you need to land your next role is right here. Create your profile once and apply to hundreds of top engineering jobs.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Button
            size="lg"
            className="w-full sm:w-auto px-6 sm:px-8 md:px-12 h-11 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg"
            onClick={() => navigate('/jobs')}
          >
            Start Applying Now
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-6 sm:px-8 md:px-12 h-11 sm:h-12 md:h-14 text-sm sm:text-base md:text-lg"
            onClick={() => navigate('/jobs')}
          >
            View Open Roles
          </Button>
        </div>

        <p className="mt-6 md:mt-8 text-xs sm:text-sm text-gray-600">
          100% Free for candidates.
        </p>
      </div>
    </section>
  );
};