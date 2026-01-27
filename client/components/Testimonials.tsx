import React from "react";
import { motion } from "framer-motion";

const TESTIMONIALS = [
    {
        name: "Sarah Chen",
        role: "Senior Developer",
        company: "Google",
        text: "This platform transformed how we build products. The speed and reliability are unmatched.",
        image: "https://i.pravatar.cc/150?img=5"
    },
    {
        name: "Michael Rodriguez",
        role: "Engineering Lead",
        company: "Microsoft",
        text: "Incredible developer experience. Our team's productivity has doubled since we started using this.",
        image: "https://i.pravatar.cc/150?img=12"
    },
    {
        name: "Emma Thompson",
        role: "CTO",
        company: "Airbnb",
        text: "The best investment we've made in our tech stack. Seamless integration and amazing support.",
        image: "https://i.pravatar.cc/150?img=9"
    },
    {
        name: "David Kim",
        role: "Backend Engineer",
        company: "Uber",
        text: "The one-click apply actually works. I didn't have to re-enter my work history ten times.",
        image: "https://i.pravatar.cc/150?img=13"
    },
    {
        name: "Jessica Martinez",
        role: "Product Manager",
        company: "Spotify",
        text: "Our deployment times went from hours to minutes. The team loves working with this tool.",
        image: "https://i.pravatar.cc/150?img=47"
    },
    {
        name: "James Wilson",
        role: "DevOps Engineer",
        company: "Netflix",
        text: "Finally, a platform that doesn't feel like a spreadsheet. The interface is beautiful.",
        image: "https://i.pravatar.cc/150?img=60"
    },
    {
        name: "Anita Patel",
        role: "Full Stack Developer",
        company: "Adobe",
        text: "WorkRaze helped me negotiate a better salary by showing me comparable roles.",
        image: "https://i.pravatar.cc/150?img=24"
    },
    {
        name: "Robert Fox",
        role: "Software Architect",
        company: "Amazon",
        text: "Cleanest job board I've ever used. The filtering actually makes sense for engineers.",
        image: "https://i.pravatar.cc/150?img=15"
    }
];

const TestimonialCard: React.FC<{ item: typeof TESTIMONIALS[0] }> = ({ item }) => {
    const [imgError, setImgError] = React.useState(false);
    const logoDevKey = import.meta.env.VITE_LOGO_DEV_PUBLIC_KEY;

    return (
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 p-5 md:p-6 w-[280px] md:w-[350px] max-w-[90vw] flex-shrink-0 hover:from-white/15 hover:to-white/10 transition-colors duration-300">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-white/20">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h4 className="text-white font-semibold text-sm">{item.name}</h4>
                    <p className="text-gray-400 text-xs">{item.role}</p>
                </div>
                <div className="ml-auto opacity-80 grayscale group-hover:grayscale-0 transition-all duration-300">
                    {!imgError && logoDevKey ? (
                        <img
                            src={`https://img.logo.dev/name/${encodeURIComponent(item.company)}?token=${logoDevKey}`}
                            alt={item.company}
                            className="w-6 h-6 object-contain"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm-1-9V5h2v2h-2zm5 9h-2v-4.5c0-.83-.67-1.5-1.5-1.5S10 10.67 10 11.5V17h-2v-8h2v1.12c.76-.98 1.76-1.12 2.5-1.12 1.93 0 3.5 1.57 3.5 3.5V17z" /></svg>
                    )}
                </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">"{item.text}"</p>
        </div>
    );
};

const MarqueeRow = ({ items, direction = "left", speed = 25 }: { items: typeof TESTIMONIALS, direction?: "left" | "right", speed?: number }) => {
    return (
        <div className="flex overflow-hidden relative w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] md:[mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
            <motion.div
                className="flex gap-4 md:gap-6 py-10"
                initial={{ x: direction === "left" ? 0 : "-50%" }}
                animate={{ x: direction === "left" ? "-50%" : 0 }}
                transition={{
                    duration: speed,
                    ease: "linear",
                    repeat: Infinity,
                    repeatType: "loop"
                }}
            >
                {/* Quadruple the items to ensure seamless loop on wider screens (tablets/desktops) */}
                {[...items, ...items, ...items, ...items].map((item, idx) => (
                    <TestimonialCard key={`${item.name}-${idx}`} item={item} />
                ))}
            </motion.div>
        </div>
    );
};

export default function Testimonials() {
    // Split data into two rows
    const row1 = TESTIMONIALS.slice(0, 4);
    const row2 = TESTIMONIALS.slice(4);

    return (
        <section className="relative py-24 bg-black overflow-hidden">
            {/* Section dividers */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 mb-16 text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-medium text-gray-300 tracking-wide uppercase">Wall of Love</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Loved by thousands of <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Engineers</span></h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                    Join the community of developers who have found their dream roles through our platform.
                </p>
            </div>

            <div className="relative w-full space-y-8">
                <MarqueeRow items={row1} direction="left" speed={30} />
                <MarqueeRow items={row2} direction="right" speed={35} />
            </div>
        </section>
    );
}