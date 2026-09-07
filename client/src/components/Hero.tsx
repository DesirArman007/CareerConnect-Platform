import React from "react";
import { Job } from "../types";
import { HeroLeftColumn } from "./HeroLeftColumn";
import { HeroVisualStage } from "./HeroVisualStage";
import { TrustedCompanies } from "./TrustedCompanies";

interface HeroProps {
  jobs?: Job[];
}

export const Hero: React.FC<HeroProps> = ({ jobs = [] }) => {
  return (
    <section className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32 md:pb-20 lg:pt-36 lg:pb-24 overflow-hidden bg-black text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[600px] h-[400px] bg-orange-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[700px] h-[500px] bg-orange-500/15 blur-[160px] rounded-full pointer-events-none" />

      {/* Subtle geometric background light rays */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-20 overflow-hidden"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="5%" y1="0%" x2="75%" y2="100%" stroke="#FF5500" strokeWidth="0.8" strokeDasharray="6 8" strokeOpacity="0.4" />
        <line x1="85%" y1="5%" x2="25%" y2="95%" stroke="#FF5500" strokeWidth="0.6" strokeOpacity="0.35" />
        <polygon
          points="80,100 480,40 680,360 400,680 60,520"
          fill="none"
          stroke="#FF5500"
          strokeWidth="0.5"
          strokeOpacity="0.2"
        />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Two-column Hero Layout */}
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] xl:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-12 items-center">

          {/* Left Column: Headline, Search, Stats */}
          <HeroLeftColumn />

          {/* Right Column: Student Cutout, Floating Cards, Annotations */}
          <HeroVisualStage />

        </div>

        {/* Bottom Banner: Trusted By Top Companies */}
        <TrustedCompanies />

      </div>
    </section>
  );
};
