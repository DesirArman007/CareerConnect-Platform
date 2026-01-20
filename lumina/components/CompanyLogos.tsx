import React from 'react';

// Icon-only versions for job cards (no text)
export const MicrosoftIcon: React.FC<{ size?: number }> = ({ size = 12 }) => (
    <div className="grid grid-cols-2 gap-0.5" style={{ width: size * 2, height: size * 2 }}>
        <div className="bg-[#F25022] rounded-sm"></div>
        <div className="bg-[#7FBA00] rounded-sm"></div>
        <div className="bg-[#00A4EF] rounded-sm"></div>
        <div className="bg-[#FFB900] rounded-sm"></div>
    </div>
);

export const LinkedInIcon: React.FC<{ size?: number }> = ({ size = 12 }) => (
    <div
        className="bg-[#0A66C2] rounded flex items-center justify-center"
        style={{ width: size * 2, height: size * 2 }}
    >
        <span className="text-white font-bold" style={{ fontSize: size }}>in</span>
    </div>
);

export const CiscoIcon: React.FC<{ size?: number }> = ({ size = 12 }) => (
    <div
        className="flex gap-0.5 items-end bg-gray-800 rounded-lg p-1"
        style={{ width: size * 2, height: size * 2 }}
    >
        {[2, 3, 4, 3, 2].map((h, i) => (
            <div
                key={i}
                className="w-0.5 bg-[#049FD9] rounded-full flex-1"
                style={{ height: `${h * 15}%` }}
            />
        ))}
    </div>
);

export const IntuitIcon: React.FC<{ size?: number }> = ({ size = 12 }) => (
    <div
        className="bg-[#365EBF] rounded-full flex items-center justify-center"
        style={{ width: size * 2, height: size * 2 }}
    >
        <div className="border-2 border-white rounded-full" style={{ width: size, height: size }}></div>
    </div>
);

export const JarIcon: React.FC<{ size?: number }> = ({ size = 12 }) => (
    <div
        className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center"
        style={{ width: size * 2, height: size * 2 }}
    >
        <span className="text-white font-bold" style={{ fontSize: size }}>J</span>
    </div>
);

export const ZeeIcon: React.FC<{ size?: number }> = ({ size = 12 }) => (
    <div
        className="bg-gradient-to-r from-purple-600 to-pink-500 rounded flex items-center justify-center"
        style={{ width: size * 2, height: size * 2 }}
    >
        <span className="text-white font-bold" style={{ fontSize: size }}>Z</span>
    </div>
);

// Helper function to get company icon by name - used in job cards
export const getCompanyIcon = (companyName: string, size: number = 24): React.ReactNode | null => {
    const name = companyName?.toLowerCase().trim() || '';

    if (name.includes('microsoft')) return <MicrosoftIcon size={size / 2} />;
    if (name.includes('linkedin')) return <LinkedInIcon size={size / 2} />;
    if (name.includes('cisco')) return <CiscoIcon size={size / 2} />;
    if (name.includes('intuit')) return <IntuitIcon size={size / 2} />;
    if (name.includes('jar')) return <JarIcon size={size / 2} />;
    if (name.includes('zee')) return <ZeeIcon size={size / 2} />;

    return null;
};

// Full logos with text (for Stats section)
export const MicrosoftLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        <MicrosoftIcon size={12} />
        <span className="text-white font-semibold tracking-tight">Microsoft</span>
    </div>
);

export const LinkedInLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        <LinkedInIcon size={12} />
        <span className="text-white font-semibold tracking-tight">LinkedIn</span>
    </div>
);

export const CiscoLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        <CiscoIcon size={12} />
        <span className="text-white font-semibold tracking-tight">Cisco</span>
    </div>
);

export const IntuitLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        <IntuitIcon size={12} />
        <span className="text-white font-semibold tracking-tight">Intuit</span>
    </div>
);

export const JarLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        <JarIcon size={12} />
        <span className="text-white font-semibold tracking-tight">Jar</span>
    </div>
);

export const ZeeLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        <ZeeIcon size={12} />
        <span className="text-white font-semibold tracking-tight">ZEE</span>
    </div>
);

// Combined component showing all logos (for Stats section)
export const CompanyLogos: React.FC = () => {
    const logos = [
        { Component: MicrosoftLogo, name: 'Microsoft' },
        { Component: LinkedInLogo, name: 'LinkedIn' },
        { Component: CiscoLogo, name: 'Cisco' },
        { Component: IntuitLogo, name: 'Intuit' },
        { Component: JarLogo, name: 'Jar' },
        { Component: ZeeLogo, name: 'ZEE' },
    ];

    return (
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {logos.map(({ Component, name }) => (
                <div
                    key={name}
                    className="opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-300 cursor-default"
                >
                    <Component />
                </div>
            ))}
        </div>
    );
};

export default CompanyLogos;
