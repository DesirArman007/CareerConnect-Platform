import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/Button";
import { jobApi } from "../services/jobs.api";
import { Job } from "../types";
import { HeroJobStack } from "./HeroJobStack";
import { Particles } from "./ui/Particles";

interface HeroProps {
  jobs?: Job[];
}

export const Hero: React.FC<HeroProps> = ({ jobs = [] }) => {
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
    <section className="relative pt-24 pb-8 sm:pt-10 sm:pb-16 md:pt-28 md:pb-24 lg:pt-32 lg:pb-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[200px] sm:h-[300px] md:h-[500px] bg-accent/20 blur-[120px] rounded-full opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[50vw] max-w-[800px] h-[300px] sm:h-[400px] md:h-[600px] bg-blue-500/10 blur-[100px] rounded-full opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-20 items-center">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-[10px] sm:text-xs font-medium text-gray-300 mb-4 sm:mb-6 md:mb-8 animate-fade-in-up min-w-[200px] sm:min-w-[220px]">
            <span
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${stats.newJobsThisWeek > 0 ? "bg-green-500" : "bg-accent"
                } animate-pulse`}
            />
            {getNewJobsText()}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] sm:leading-[1.05] mb-4 sm:mb-5 md:mb-6 break-words w-full max-w-full px-1">
            Top Companies{" "}
            <span className="text-gradient-accent">That Are Actively</span> Hiring.
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-gray-400 mb-6 sm:mb-7 md:mb-8 max-w-lg leading-relaxed mx-auto lg:mx-0">
            Stop visiting fifty different career pages. Access direct company
            listings, use one-click applications, and see fresh opportunities
            dropped daily.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10 md:mb-12 w-full sm:w-auto justify-center lg:justify-start">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-base"
              onClick={() => navigate("/explore")}
            >
              Start Applying Now <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-base"
              onClick={() => navigate("/explore")}
            >
              View Open Roles
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full pt-6 sm:pt-8 border-t border-white/5 justify-center max-w-2xl lg:max-w-none">
            <div className="flex items-center sm:items-start gap-3 text-left">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">
                  Direct Applications
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Apply directly to the source. No third-party recruiters.
                </p>
              </div>
            </div>
            <div className="flex items-center sm:items-start gap-3 text-left">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">
                  Fresh Listings Daily
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  New opportunities added every day from top companies worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block relative w-full perspective-1000 group mt-12 lg:mt-0">

          {/* Separator Line (Visible only on mobile now) */}
          <div className="w-full max-w-[200px] h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent mb-12 lg:hidden" />

          {jobs.length > 0 ? (
            <div className="relative flex justify-center lg:justify-end">
              {/* Particles Originating from Bottom-Left of Card */}
              <div className="absolute -left-32 -bottom-20 w-[600px] h-[700px] -z-10 pointer-events-none opacity-80">
                <Particles />
              </div>

              <div className="relative z-10 animate-fade-in-up delay-200">
                <HeroJobStack jobs={jobs} />
              </div>
            </div>
          ) : (
            <div className="relative h-[400px] w-full flex items-center justify-center">
              <div className="absolute inset-0 bg-grid opacity-30 mask-radial" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
