import React, { useState } from 'react';
import logoPng from '../../assets/logo.png';

export interface LogoProps {
    className?: string;
    imageClassName?: string;
    textClassName?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    showText?: boolean;
    onClick?: () => void;
}

const SIZE_MAP = {
    xs: { img: 'w-6 h-6', text: 'text-sm' },
    sm: { img: 'w-8 h-8', text: 'text-base' },
    md: { img: 'w-10 h-10', text: 'text-lg' },
    lg: { img: 'w-12 h-12', text: 'text-xl' },
    xl: { img: 'w-16 h-16', text: 'text-2xl' },
};

export const Logo: React.FC<LogoProps> = ({
    className = '',
    imageClassName = '',
    textClassName = '',
    size = 'md',
    showText = false,
    onClick,
}) => {
    const [imgError, setImgError] = useState(false);

    const sizeConfig = typeof size === 'string' ? SIZE_MAP[size] || SIZE_MAP.md : null;
    const customDimStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : undefined;

    const imgClasses = typeof size === 'string'
        ? `${sizeConfig?.img || 'w-10 h-10'} ${imageClassName}`
        : `${imageClassName}`;

    const textClasses = typeof size === 'string'
        ? `${sizeConfig?.text || 'text-lg'} ${textClassName}`
        : `${textClassName}`;

    return (
        <div
            className={`flex items-center gap-2.5 ${onClick ? 'cursor-pointer group' : ''} ${className}`}
            onClick={onClick}
        >
            {!imgError ? (
                <img
                    src={logoPng || '/assets/logo.png'}
                    alt="WorkRaze Logo"
                    style={customDimStyle}
                    className={`object-contain transition-transform duration-200 ${onClick ? 'group-hover:scale-105' : ''} ${imgClasses}`}
                    onError={() => setImgError(true)}
                    loading="eager"
                />
            ) : (
                /* Sleek SVG fallback in brand orange gradient if image cannot be loaded */
                <div
                    style={customDimStyle}
                    className={`rounded-xl bg-gradient-to-br from-[#FF5500] via-[#FF6A00] to-[#E04400] flex items-center justify-center shadow-md shadow-orange-500/20 text-white font-black select-none ${imgClasses}`}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3/5 h-3/5 text-white stroke-current"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M4 4l4 16 4-12 4 12 4-16" />
                    </svg>
                </div>
            )}

            {showText && (
                <span
                    className={`font-bold tracking-tight text-white transition-colors duration-200 ${onClick ? 'group-hover:text-gray-200' : ''} ${textClasses}`}
                >
                    WorkRaze
                </span>
            )}
        </div>
    );
};

export default Logo;
