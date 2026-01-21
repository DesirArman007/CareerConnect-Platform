import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/Button";
import { jobs as jobApi } from "../services/api";

export const Hero = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalJobs: 0,
    newJobsThisWeek: 0,
    jobTypes: { jobs: 0, internships: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await jobApi.getStats();
        const statsData = response?.data;

        if (!statsData || typeof statsData.newJobsThisWeek !== "number") {
          console.error("Invalid stats response", response);
          return;
        }

        setStats(statsData);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ✅ Correct text logic
  const getNewJobsText = () => {
    if (isLoading) return "Loading job updates...";
    if (stats.newJobsThisWeek <= 0) return "Fresh Jobs Updated Daily";
    if (stats.newJobsThisWeek >= 100)
      return `${stats.newJobsThisWeek}+ New Roles Added This Week`;

    return `${stats.newJobsThisWeek} New Roles Added This Week`;
  };

  return (
    <section className="relative pt-24 pb-16 md:pt-48 md:pb-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[300px] md:h-[500px] bg-accent/20 blur-[120px] rounded-full opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[50vw] max-w-[800px] h-[400px] md:h-[600px] bg-blue-500/10 blur-[100px] rounded-full opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div className="flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs font-medium text-gray-300 mb-8 animate-fade-in-up">
            <span
              className={`w-2 h-2 rounded-full ${stats.newJobsThisWeek > 0 ? "bg-green-500" : "bg-accent"
                } animate-pulse`}
            />
            {getNewJobsText()}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.15] mb-4 md:mb-6">
            Find and apply to{" "}
            <span className="text-gradient-accent">all relevant jobs</span> in one
            place.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 md:mb-8 max-w-lg leading-relaxed">
            Stop visiting fifty different career pages. Access direct company
            listings, use one-click applications, and see fresh opportunities
            dropped daily.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 w-full sm:w-auto">
            <Button variant="secondary" size="lg" onClick={() => navigate("/jobs")}>
              Start Applying Now <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/jobs")}>
              View Open Roles
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full pt-8 border-t border-white/5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Direct Applications
                </h3>
                <p className="text-sm text-gray-500">
                  Apply directly to the source. No third-party recruiters.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-white mb-1">
                  One-Click Apply
                </h3>
                <p className="text-sm text-gray-500">
                  Fill your profile once. Apply everywhere instantly.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative h-[400px] w-full hidden lg:flex items-center justify-center">
          <div className="absolute inset-0 bg-grid opacity-30 mask-radial" />
        </div>
      </div>
    </section>
  );
};
