import React, { useState } from 'react';

export interface CompanyLogoProps {
    company: string;
    logo?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ company, logo, size = 'md' }) => {
    const [logoDevError, setLogoDevError] = useState(false);
    const [providedLogoError, setProvidedLogoError] = useState(false);
    const name = company?.toLowerCase().trim() || '';
    const logoDevKey = import.meta.env.VITE_LOGO_DEV_PUBLIC_KEY;

    const sizeClasses = {
        xs: 'w-10 h-10 rounded-xl',
        sm: 'w-12 h-12 rounded-xl',
        md: 'w-14 h-14 rounded-2xl',
        lg: 'w-18 h-18 sm:w-20 sm:h-20 rounded-2xl',
    }[size];
    const iconSizes = {
        xs: 'w-5 h-5',
        sm: 'w-6 h-6',
        md: 'w-7 h-7',
        lg: 'w-10 h-10 sm:w-11 sm:h-11',
    }[size];
    const shell = (className: string, children: React.ReactNode) => (
        <div className={`${sizeClasses} ${className} flex items-center justify-center flex-shrink-0`}>{children}</div>
    );

    if (name.includes('cloudflare')) {
        return shell('bg-[#1D140C] border border-[#F6821F]/30 shadow-[0_2px_14px_-2px_rgba(246,130,31,0.2)]',
            <svg viewBox="0 0 24 24" className={iconSizes} fill="#F6821F"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" /></svg>);
    }
    if (name.includes('supabase')) {
        return shell('bg-[#0B1E17] border border-[#184635] shadow-[0_2px_14px_-2px_rgba(62,207,142,0.15)]',
            <svg viewBox="0 0 109 113" className={iconSizes} fill="none"><path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1934 40.0627C107.384 40.0627 111.954 49.5226 106.842 55.9614L63.7076 110.284Z" fill="#1CA567" /><path d="M45.317 2.71635C48.1765 -0.885132 53.9744 1.08778 54.0433 5.68603L54.3496 72.8251L9.83151 72.8251C1.6405 72.8251 -2.92984 63.3652 2.18182 56.9264L45.317 2.71635Z" fill="#3ECF8E" /></svg>);
    }
    if (name.includes('amazon') || name.includes('aws')) {
        return shell('bg-[#131921] border border-[#232F3E]', <span className="text-[#FF9900] font-bold text-xl">a</span>);
    }
    if (name.includes('figma')) {
        return shell('bg-[#1E1528] border border-[#3B2752]', <span className="text-[#F24E1E] font-bold text-xl">F</span>);
    }
    if (name.includes('vercel')) {
        return shell('bg-[#111111] border border-white/20', <span className="text-white text-2xl">▲</span>);
    }
    if (name.includes('openai')) {
        return shell('bg-[#131D1A] border border-[#10A37F]/30', <span className="text-[#10A37F] font-bold text-xl">◎</span>);
    }
    if (name.includes('google')) {
        return shell('bg-[#1A1D24] border border-white/10', <span className="text-[#4285F4] font-bold text-xl">G</span>);
    }
    if (name.includes('microsoft')) {
        return shell('bg-[#1A1F2C] border border-[#00A4EF]/20', <div className="grid grid-cols-2 gap-1 w-6 h-6"><div className="bg-[#F25022]" /><div className="bg-[#7FBA00]" /><div className="bg-[#00A4EF]" /><div className="bg-[#FFB900]" /></div>);
    }
    if (name.includes('stripe')) {
        return shell('bg-[#0F172A] border border-[#635BFF]/30', <span className="text-[#635BFF] font-black text-2xl">S</span>);
    }
    if (name.includes('netflix')) {
        return shell('bg-[#1B0D10] border border-[#E50914]/25', <span className="text-[#E50914] font-black text-2xl">N</span>);
    }
    if (name.includes('spotify')) {
        return shell('bg-[#0C1E14] border border-[#1DB954]/25', <span className="text-[#1DB954] font-bold text-xl">●</span>);
    }

    if (logoDevKey && !logoDevError) {
        return shell('bg-white/[0.04] border border-white/[0.08] p-2',
            <img src={`https://img.logo.dev/name/${encodeURIComponent(company)}?token=${logoDevKey}`} alt={company} onError={() => setLogoDevError(true)} className="w-full h-full object-contain rounded-lg" />);
    }
    if (logo && !providedLogoError) {
        return shell('bg-white/[0.04] border border-white/[0.08] p-2',
            <img src={logo} alt={company} onError={() => setProvidedLogoError(true)} className="w-full h-full object-contain rounded-lg" />);
    }
    return shell('bg-[#16171C] border border-white/[0.08] text-white font-bold text-base sm:text-xl shadow-sm', company?.charAt(0)?.toUpperCase() || 'J');
};

