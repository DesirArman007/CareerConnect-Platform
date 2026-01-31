import React, { useEffect, useState } from "react";
import { jobApi } from "../services/jobs.api";
import { CompanyLogos } from "./CompanyLogos";

export const Stats: React.FC = () => {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState<number | null>(null);

  // 1️⃣ Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await jobApi.getStats();
        const statsData = response?.data;

        if (!statsData?.totalJobs) {
          console.error("Invalid stats response", response);
          return;
        }

        setTarget(statsData.totalJobs);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };

    fetchStats();
  }, []);

  // 2️⃣ Animate number when target is ready
  useEffect(() => {
    if (target === null) return;

    let current = 0;
    const duration = 2000;
    const steps = 60;
    const increment = Math.ceil(target / steps);
    const interval = duration / steps;

    setCount(0);

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <section className="py-24 bg-black relative border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="mb-20">
          <CompanyLogos />
        </div>

        <div className="relative inline-block">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-4">
            Active Opportunities Available
          </p>

          <h2 className="text-6xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-800 font-mono min-w-[180px] md:min-w-[350px] inline-block text-center">
            {count.toLocaleString()}
          </h2>

          <p className="mt-4 text-gray-600">
            Real roles from real companies. Ready for your application.
          </p>
        </div>
      </div>
    </section>
  );
};
