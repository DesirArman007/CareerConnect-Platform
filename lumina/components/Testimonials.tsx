import React from 'react';
import { TESTIMONIALS } from '../constants';

export const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-black relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">No more endless searching</h2>
                <p className="text-gray-500">See why engineers are switching their search to Lumina.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
                {TESTIMONIALS.map((item, idx) => (
                    <div key={idx} className="relative p-8 rounded-2xl bg-surface/30 border border-white/5 hover:border-white/10 transition-colors group">
                        <div className="absolute top-8 left-8 text-6xl font-serif text-white/5 group-hover:text-accent/10 transition-colors">"</div>
                        <p className="relative z-10 text-lg text-gray-300 mb-6 leading-relaxed italic">
                            {item.text}
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-black border border-white/10 flex items-center justify-center font-bold text-white">
                                {item.name[0]}
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">{item.name}</h4>
                                <p className="text-sm text-gray-500">{item.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  );
};