import React from 'react';
import { TESTIMONIALS } from '../constants';

export const Testimonials: React.FC = () => {
    return (
        <section className="py-12 sm:py-16 md:py-24 bg-black relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-8 sm:mb-12 md:mb-16">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">No more endless searching</h2>
                    <p className="text-sm sm:text-base text-gray-500">See why engineers are switching their search to Lumina.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    {TESTIMONIALS.map((item, idx) => (
                        <div key={idx} className="relative p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-surface/30 border border-white/5 hover:border-white/10 transition-colors group">
                            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 text-4xl sm:text-5xl md:text-6xl font-serif text-white/5 group-hover:text-accent/10 transition-colors">"</div>
                            <p className="relative z-10 text-sm sm:text-base md:text-lg text-gray-300 mb-4 sm:mb-6 leading-relaxed italic pl-4 sm:pl-0">
                                {item.text}
                            </p>
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-700 to-black border border-white/10 flex items-center justify-center font-bold text-white text-sm sm:text-base flex-shrink-0">
                                    {item.name[0]}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-white text-sm sm:text-base truncate">{item.name}</h4>
                                    <p className="text-xs sm:text-sm text-gray-500 truncate">{item.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};