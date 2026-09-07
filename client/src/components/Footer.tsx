import React from 'react';
import { Logo } from './ui/Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="py-8 border-t border-white/5 text-sm text-gray-500">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <Logo size="xs" showText />
          <span className="hidden sm:inline text-white/20">|</span>
          <p>© 2026 WorkRaze. Skip aggregators. Direct careers.</p>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
        </div>
      </div>
    </footer>
  );
};
