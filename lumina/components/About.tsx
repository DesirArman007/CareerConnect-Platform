import React from 'react';
import { Terminal, Code2, Heart, Github, Twitter } from 'lucide-react';

export const About: React.FC = () => {
    return (
        <section id="about" className="py-12 sm:py-24 bg-surface/30 relative border-t border-white/5">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">

                    {/* Left: Visual/Icon */}
                    <div className="hidden md:flex flex-col items-center gap-4 mt-2">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                            <Terminal className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="w-px h-32 bg-gradient-to-b from-white/10 to-transparent" />
                    </div>

                    {/* Right: Content */}
                    <div className="flex-1 space-y-6 sm:space-y-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
                                <span className="md:hidden"><Terminal className="w-5 h-5 sm:w-6 sm:h-6 text-accent" /></span>
                                Behind the Project
                            </h2>

                            <div className="space-y-4 text-gray-400">
                                <p className="text-sm sm:text-base leading-relaxed">
                                    Hi, I'm <span className="text-white font-medium">Abhishek Yadav</span> — a developer passionate about building tools that solve real problems.
                                </p>
                                <p className="text-sm sm:text-base leading-relaxed">
                                    I built Lumina because I was tired of the job hunt shuffle—opening fifty tabs, dealing with broken recruiter sites, and endlessly re-entering my resume data. I wanted a place that just works.
                                </p>
                                <p className="text-sm sm:text-base leading-relaxed">
                                    Lumina aggregates jobs directly from company career pages, giving you a clean, noise-free feed of opportunities. No third-party recruiters, no ghost jobs.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4">
                            <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                                <div className="flex items-center gap-2 mb-2 text-white font-medium text-sm sm:text-base">
                                    <Code2 className="w-4 h-4 text-blue-400" />
                                    Built to Learn
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    This project is my way of breaking the "tutorial hell" cycle. I wanted to ship something real, usable, and polished.
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                                <div className="flex items-center gap-2 mb-2 text-white font-medium text-sm sm:text-base">
                                    <Heart className="w-4 h-4 text-red-400" />
                                    Open Source
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500">
                                    Everything here is built with React and modern web standards. It's a labor of love for the dev community.
                                </p>
                            </div>
                        </div>

                        {/* Connect Section */}
                        <div className="pt-4 sm:pt-6 border-t border-white/5">
                            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Connect</h3>
                            <div className="flex flex-wrap gap-3 sm:gap-4">
                                <a
                                    href="https://github.com/DesirArman007"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                                >
                                    <Github className="w-4 h-4" />
                                    <span className="text-xs sm:text-sm font-medium">GitHub</span>
                                </a>
                                <a
                                    href="https://x.com/iamdesirarman"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                                >
                                    <Twitter className="w-4 h-4" />
                                    <span className="text-xs sm:text-sm font-medium">Twitter</span>
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
