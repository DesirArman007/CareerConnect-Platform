import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = true, ...props }) => {
  return (
    <div
      className={`
        relative bg-surface border border-white/10 rounded-xl overflow-hidden
        ${hoverEffect ? 'hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_10px_40px_-10px_rgba(255,255,255,0.05)]' : ''}
        transition-all duration-300 ease-out
        ${className}
      `}
      {...props}
    >
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />

      {children}
    </div>
  );
};
