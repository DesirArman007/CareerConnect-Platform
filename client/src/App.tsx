import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { Header } from './components/Header';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import { AIChat } from './components/AIChat';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './components/pages/HomePage';
import { JobsPage } from './components/pages/JobsPage';
import { JobDetailPage } from './components/pages/JobDetailPage';
import { CompaniesPage } from './components/pages/CompaniesPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { AboutPage } from './components/pages/AboutPage'; // Removed LandingPage import if unused, or keep
import { LoginPage } from './components/pages/LoginPage';
import { SignupPage } from './components/pages/SignupPage';
import { GoogleOAuthProvider } from '@react-oauth/google';


import { MobileTopBar } from './components/mobile/MobileTopBar';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Toaster position="top-center" toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }} />
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-white overflow-x-hidden pb-16 md:pb-0">
            {/* Global subtle grid background */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-40 mix-blend-overlay"></div>

            <MobileTopBar className="md:hidden" />
            <Header />

            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<JobsPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              <Route path="/companies" element={<CompaniesPage />} />
              <Route path="/company/:companySlug" element={<JobsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Routes>

            <footer className="py-8 border-t border-white/5 text-center text-sm text-gray-600">
              <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <p>© 2026 WorkRaze Jobs. All rights reserved.</p>
                <div className="flex gap-6">
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
                  <a href="#" className="hover:text-white transition-colors">Twitter</a>
                </div>
              </div>
            </footer>

            <MobileBottomNav className="md:hidden" />

            {/* Floating AI Agent */}
            <AIChat />

            {/* Vercel Speed Insights & Analytics - debug disabled to hide console logs */}
            <SpeedInsights debug={false} />
            <Analytics debug={false} />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>

  );
}

export default App;