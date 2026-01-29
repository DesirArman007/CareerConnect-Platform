import React, { useState, useEffect, useRef } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Edit2 } from 'lucide-react';

type AuthStep = 'email' | 'login' | 'signup';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register, googleLogin, user, isLoading: authLoading } = useAuth();

    // Flow state
    const [step, setStep] = useState<AuthStep>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Dynamic width for Google Button
    const googleButtonWrapper = useRef<HTMLDivElement>(null);
    const [googleBtnWidth, setGoogleBtnWidth] = useState<string>('300');

    useEffect(() => {
        // Simple resizing logic
        const handleResize = () => {
            if (googleButtonWrapper.current) {
                const width = googleButtonWrapper.current.offsetWidth;
                if (width > 0) {
                    setGoogleBtnWidth(width.toString());
                }
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    /**
     * Handle redirect message / prefilled email / step
     */
    useEffect(() => {
        if (location.state?.message) setMessage(location.state.message);
        if (location.state?.email) setEmail(location.state.email);
        // Default to email step if not specified, but respect if passed
        if (location.state?.step) setStep(location.state.step);
    }, [location.state]);

    /**
     * ✅ SINGLE redirect authority
     */
    useEffect(() => {
        if (!authLoading && user) {
            const returnUrl = location.state?.returnUrl || '/dashboard';
            navigate(returnUrl, { replace: true });
        }
    }, [user, authLoading, navigate, location.state]);

    /**
     * Global auth loading screen
     */
    if (authLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="text-gray-400 animate-pulse">Loading...</div>
            </main>
        );
    }

    /**
     * Event handlers
     */
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await login({ email, password });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }
            await register({ name, email, password });
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSuccess = async (credential: string) => {
        setError('');
        try {
            await googleLogin(credential);
        } catch {
            setError('Google login failed');
        }
    };

    const handleEmailContinue = (nextStep: 'login' | 'signup') => {
        if (!email) {
            setError('Please enter your email address');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }
        setError('');
        setStep(nextStep);
    };

    // Render Steps
    return (
        <main className="min-h-screen pt-16 pb-32 md:pt-24 md:pb-0 px-4 flex items-center justify-center bg-[#f0f2f5] dark:bg-[#0a0a0a]">
            {/* Background hint if needed, or keep clean */}

            <Card className="w-full max-w-[440px] p-6 md:p-10 bg-white dark:bg-surface border border-gray-200 dark:border-white/10 shadow-xl rounded-2xl">
                {/* Message Banner - styled like reference */}
                {message && (
                    <div className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm text-center">
                        {message}
                    </div>
                )}

                {/* Header Section */}
                <div className="text-center mb-8">
                    <img src="/assets/logo.png" alt="WorkRaze" className="w-12 h-12 mx-auto mb-4" />

                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {step === 'email' && 'Continue to WorkRaze'}
                        {step === 'login' && 'Welcome back'}
                        {step === 'signup' && 'Create your account'}
                    </h2>
                </div>

                {/* Step 1: Email Input & Selection */}
                {step === 'email' && (
                    <div className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder="name@work.com"
                                className="bg-white dark:bg-black/20"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <Button
                                onClick={() => handleEmailContinue('login')}
                                className="w-full h-11 text-base font-medium"
                            >
                                Login
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleEmailContinue('signup')}
                                className="w-full h-11 text-base font-medium border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                                Sign Up
                            </Button>
                        </div>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-surface text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div ref={googleButtonWrapper} className="flex justify-center w-full">
                            <GoogleLogin
                                onSuccess={credentialResponse => {
                                    if (credentialResponse.credential) {
                                        handleGoogleSuccess(credentialResponse.credential);
                                    }
                                }}
                                onError={() => setError('Google Login Failed')}
                                theme="filled_blue"
                                shape="pill"
                                width={googleBtnWidth}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Login (Password) */}
                {step === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                            <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{email}</span>
                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
                            >
                                <Edit2 className="w-3 h-3" /> Change
                            </button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                <button type="button" className="text-xs text-accent hover:underline" tabIndex={-1}>Forgot?</button>
                            </div>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="bg-white dark:bg-black/20"
                                autoFocus
                                required
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <Button
                                type="submit"
                                className="w-full h-11 text-base"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Logging in...' : 'Login'}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setStep('email')}
                                className="w-full text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                        </div>
                    </form>
                )}

                {/* Step 3: Signup (Name + Password) */}
                {step === 'signup' && (
                    <form onSubmit={handleSignup} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                            <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{email}</span>
                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
                            >
                                <Edit2 className="w-3 h-3" /> Change
                            </button>
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Jane Doe"
                                className="bg-white dark:bg-black/20"
                                autoFocus
                                required
                            />

                            <Input
                                label="Create Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min 6 characters"
                                className="bg-white dark:bg-black/20"
                                required
                            />
                        </div>

                        <div className="space-y-3 pt-4">
                            <Button
                                type="submit"
                                className="w-full h-11 text-base"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setStep('email')}
                                className="w-full text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                        </div>
                    </form>
                )}
            </Card>
        </main>
    );
};
