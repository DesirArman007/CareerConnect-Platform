import React, { useEffect, useState, useRef } from 'react';
import { jobs as jobApi } from '../services/api';
import { CompanyLogos } from './CompanyLogos';

export const Stats: React.FC = () => {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(0); // Will be fetched from API
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Fetch actual job count from API
  useEffect(() => {
    const fetchJobCount = async () => {
      try {
        // Fetch with page 1 to get pagination info with total count
        const response = await jobApi.getAll(1, 1);
        if (response.pagination?.totalJobs) {
          setTarget(response.pagination.totalJobs);
        }
      } catch (error) {
        console.error("Failed to fetch job count", error);
        // Fallback to a reasonable default if API fails
        setTarget(1700);
      }
    };
    fetchJobCount();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated && target > 0) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, target]);

  useEffect(() => {
    if (!hasAnimated || target === 0) return;

    // A simple animation logic to ramp up numbers
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    const increment = target / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [hasAnimated, target]);

  return (
    <section ref={ref} className="py-24 bg-black relative border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Company Logos */}
        <div className="mb-20">
          <CompanyLogos />
        </div>

        <div className="relative inline-block">
          {/* Particles floating around number */}
          <div className="absolute -top-10 -left-10 w-4 h-4 bg-accent/50 rounded-full animate-blob filter blur-sm" />
          <div className="absolute top-1/2 -right-20 w-3 h-3 bg-white/30 rounded-full animate-pulse delay-75" />
          <div className="absolute -bottom-10 left-10 w-2 h-2 bg-blue-500/50 rounded-full animate-bounce" />

          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-4">Active Opportunities Available</p>
          <h2 className="text-6xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-800 font-mono">
            {count.toLocaleString()}
          </h2>
          <p className="mt-4 text-gray-600">Real roles from real companies. Ready for your application.</p>
        </div>
      </div>
    </section>
  );
};