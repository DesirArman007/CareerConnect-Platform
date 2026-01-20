import React from 'react';
import { Header } from './components/Header';
import { AuthProvider } from './context/AuthContext';

import { AIChat } from './components/AIChat';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { JobsPage } from './components/pages/JobsPage';
import { JobDetailPage } from './components/pages/JobDetailPage';
import { CompaniesPage } from './components/pages/CompaniesPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { LandingPage } from './components/pages/LandingPage';
import { AboutPage } from './components/pages/AboutPage';
import { LoginPage } from './components/pages/LoginPage';
import { SignupPage } from './components/pages/SignupPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-white">
          {/* Global subtle grid background */}
          <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-50 mix-blend-overlay"></div>

          <Header />

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>

          <footer className="py-8 border-t border-white/5 text-center text-sm text-gray-600">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <p>© 2026 Lumina Jobs. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Twitter</a>
              </div>
            </div>
          </footer>

          {/* Floating AI Agent */}
          <AIChat />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;