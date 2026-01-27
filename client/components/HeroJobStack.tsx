import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Job } from '../types';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCompanyIcon } from './CompanyLogos';

interface HeroJobStackProps {
    jobs: Job[];
}

export const HeroJobStack: React.FC<HeroJobStackProps> = ({ jobs }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const displayJobs = jobs.slice(0, 5);

    // Mouse tracking motion values
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth springs for rotation - REFINE
    const rotateX = useSpring(useTransform(y, [-250, 250], [16, -16]), { stiffness: 150, damping: 20 });
    const rotateY = useSpring(useTransform(x, [-250, 250], [-16, 16]), { stiffness: 150, damping: 20 });

    const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleApply = (e: React.MouseEvent, job: Job) => {
        e.stopPropagation();
        if (!user) {
            navigate('/login', {
                state: {
                    message: "You need to be logged in to apply",
                    returnUrl: `/jobs/${job._id || job.id}`
                }
            });
            return;
        }
        const applyUrl = job.apply_url || job.applyUrl;
        if (applyUrl) window.open(applyUrl, '_blank');
        else navigate(`/jobs/${job._id || job.id}`);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMobile) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX - width / 2;
        const yPct = mouseY - height / 2;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <div
            className="relative w-[90vw] max-w-[380px] h-[360px] sm:h-[500px] perspective-1000 mx-auto"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* 3D Container */}
            <motion.div
                className="relative w-full h-full preserve-3d"
                style={isMobile ? {} : { rotateX, rotateY }}
                initial={isMobile ? { rotateY: -15, rotateX: 5 } : {}}
                animate={isMobile ? {
                    rotateY: -10,
                    rotateX: 2,
                    y: [0, -10, 0] // Gentle float for mobile "still" look
                } : {
                    y: [0, -15, 0] // Gentle float for desktop
                }}
                transition={{
                    rotateY: { type: "spring", stiffness: 50 },
                    y: { repeat: Infinity, duration: 6, ease: "easeInOut" }
                }}
            >

                {/* Back Card 2 (Deepest) */}
                <div
                    className="absolute inset-0 bg-white/5 rounded-2xl border border-white/5 shadow-2xl"
                    style={{ transform: "translateZ(-40px) translateY(20px) translateX(20px)", opacity: 0.4 }}
                />

                {/* Back Card 1 (Middle) */}
                <div
                    className="absolute inset-0 bg-surface/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl"
                    style={{ transform: "translateZ(-20px) translateY(10px) translateX(10px)", opacity: 0.7 }}
                />

                {/* Front Card (Main) */}
                <div className="absolute inset-0 bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                    {/* Glow Effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[80px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

                    {/* Header */}
                    <div className="p-6 border-b border-white/5 relative z-10 flex items-center justify-between">
                        <div>
                            <h3 className="text-white font-semibold text-lg">Latest Openings</h3>
                            <p className="text-xs text-gray-400">Live updates from top companies</p>
                        </div>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                        </div>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-2">
                        {displayJobs.map((job) => (
                            <div
                                key={job._id || job.id}
                                className="p-3 mb-2 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all group/item cursor-pointer"
                                onClick={() => navigate(`/jobs/${job._id || job.id}`)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center flex-shrink-0 border border-white/10 text-white font-bold text-sm">
                                        {getCompanyIcon(job.company, 20) || job.company.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-medium text-xs sm:text-sm line-clamp-2 leading-tight group-hover/item:text-accent transition-colors mb-0.5">
                                            {job.title}
                                        </h4>
                                        <p className="text-gray-500 text-[10px] sm:text-xs truncate">{job.company}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                                                {job.type || 'Full-time'}
                                            </span>
                                            <Button
                                                size="sm"
                                                className="h-6 px-3 text-[10px] ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity"
                                                onClick={(e) => handleApply(e, job)}
                                            >
                                                Apply Now
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Reflection / Ground Shadow */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-black/50 blur-xl rounded-[100%]" />
        </div>
    );
};
