import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, ShieldCheck, Zap } from 'lucide-react';

export const CTA: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 md:py-28 lg:py-36 relative overflow-hidden">
      {/* Dark background with warm radial glows */}
      <div className="absolute inset-0 bg-[#0A0A0A]" />

      {/* Left glow */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/3 w-[500px] h-[500px] rounded-full bg-[#FF6B00]/[0.06] blur-[120px] pointer-events-none" />

      {/* Right glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] rounded-full bg-[#FF6B00]/[0.06] blur-[120px] pointer-events-none" />

      {/* Subtle curved shapes on sides */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[300px] h-[600px] opacity-[0.04] pointer-events-none">
        <div className="w-full h-full rounded-full border border-orange-400/30" />
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-[600px] opacity-[0.04] pointer-events-none">
        <div className="w-full h-full rounded-full border border-orange-400/30" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.15] mb-5 md:mb-7">
          Stop searching.
          <br />
          <span className="text-gradient-accent">Start applying.</span>
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-[17px] text-[#9CA3AF] mb-8 md:mb-10 max-w-xl mx-auto leading-relaxed">
          Create your profile once, discover relevant engineering roles,
          <br className="hidden sm:block" />
          and apply without starting from scratch every time.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          {/* Primary CTA - orange gradient */}
          <button
            onClick={() => navigate('/register')}
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl text-sm sm:text-[15px] font-semibold text-white bg-gradient-to-r from-[#FF4F00] to-[#FF8C00] hover:from-[#FF6010] hover:to-[#FF9A10] shadow-[0_4px_24px_-4px_rgba(255,100,0,0.45)] hover:shadow-[0_6px_32px_-4px_rgba(255,100,0,0.55)] transition-all duration-200"
          >
            Start Applying Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </button>

          {/* Secondary CTA - outline */}
          <button
            onClick={() => navigate('/explore')}
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl text-sm sm:text-[15px] font-semibold text-white bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/[0.04] transition-all duration-200"
          >
            View Open Roles
          </button>
        </div>

        {/* Trust badges */}
        <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
          <div className="flex items-center gap-2 text-[#7B7F87] text-xs sm:text-[13px]">
            <Users className="w-4 h-4 text-[#FF8C00]/70" />
            <span>100% Free for candidates</span>
          </div>

          <span className="hidden sm:block h-3.5 w-px bg-white/[0.12] mx-5" />

          <div className="flex items-center gap-2 text-[#7B7F87] text-xs sm:text-[13px]">
            <ShieldCheck className="w-4 h-4 text-[#FF8C00]/70" />
            <span>No hidden fees</span>
          </div>

          <span className="hidden sm:block h-3.5 w-px bg-white/[0.12] mx-5" />

          <div className="flex items-center gap-2 text-[#7B7F87] text-xs sm:text-[13px]">
            <Zap className="w-4 h-4 text-[#FF8C00]/70" />
            <span>Get noticed by top companies</span>
          </div>
        </div>
      </div>
    </section>
  );
};