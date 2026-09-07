import React from 'react';
import { Building2, Users } from 'lucide-react';

export const About: React.FC = () => {
    return (
        <section id="about" className="pt-28 sm:pt-32 pb-24 relative overflow-hidden">
            {/* Ambient orange glow in background */}
            <div className="absolute left-0 top-32 w-[450px] h-[450px] rounded-full bg-[#FF5500]/[0.03] blur-[150px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Category Pill / Tag */}
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 mb-3 sm:mb-4">
                    ABOUT WORKRAZE
                </p>

                {/* Main Heading */}
                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-tight mb-4">
                    Built for Job Seekers
                </h1>

                {/* Description Paragraph */}
                <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-2xl mb-8 sm:mb-10">
                    WorkRaze brings engineering jobs directly from company career pages, giving you a clean, noise-free place to discover opportunities.
                </p>

                {/* Two Core Value Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-10 sm:mb-12">
                    {/* Card 1: Direct from Companies */}
                    <div className="bg-[#0D0F12] border border-white/[0.08] hover:border-white/15 rounded-2xl p-6 sm:p-7 flex items-start gap-4 sm:gap-5 transition-all duration-200">
                        <div className="w-12 h-12 rounded-xl bg-[#24150D] border border-orange-500/30 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5 text-[#FF6A26]" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-base sm:text-[17px] tracking-tight mb-1.5">
                                Direct from Companies
                            </h2>
                            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                                We aggregate jobs directly from official company career pages.
                            </p>
                        </div>
                    </div>

                    {/* Card 2: No Third-Party Recruiters */}
                    <div className="bg-[#0D0F12] border border-white/[0.08] hover:border-white/15 rounded-2xl p-6 sm:p-7 flex items-start gap-4 sm:gap-5 transition-all duration-200">
                        <div className="w-12 h-12 rounded-xl bg-[#24150D] border border-orange-500/30 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-[#FF6A26]" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-base sm:text-[17px] tracking-tight mb-1.5">
                                No Third-Party Recruiters
                            </h2>
                            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                                A cleaner, more relevant job feed without recruiter noise or ghost jobs.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider Line */}
                <div className="border-t border-white/[0.08] my-10 sm:my-12" />

                {/* Section: Built by a Developer */}
                <div className="space-y-3 mb-10 sm:mb-12">
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        Built by a Developer
                    </h2>
                    <p className="text-neutral-400 text-sm sm:text-base leading-relaxed max-w-2xl">
                        WorkRaze is a personal project by Abhishek Yadav — a developer who believes job hunting can be simpler, cleaner, and more genuine.
                    </p>
                </div>

                {/* Divider Line */}
                <div className="border-t border-white/[0.08] my-10 sm:my-12" />

                {/* Section: Connect */}
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-4 sm:mb-5">
                        Connect
                    </h2>
                    <div className="flex flex-wrap items-center gap-3">
                        <a
                            href="https://github.com/DesirArman007"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#121418] hover:bg-[#181A20] border border-white/10 hover:border-white/20 text-white text-sm font-medium transition-all shadow-sm cursor-pointer"
                        >
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                            </svg>
                            <span>GitHub</span>
                        </a>

                        <a
                            href="https://x.com/iamdesirarman"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#121418] hover:bg-[#181A20] border border-white/10 hover:border-white/20 text-white text-sm font-medium transition-all shadow-sm cursor-pointer"
                        >
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-white" aria-hidden="true">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
                            </svg>
                            <span>Twitter</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
