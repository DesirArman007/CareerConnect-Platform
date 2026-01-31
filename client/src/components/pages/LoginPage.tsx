import React, { useState, useEffect, useRef } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

type AuthStep = 'email' | 'login' | 'signup';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register, googleLogin, user, isLoading: authLoading } = useAuth();

    const [step, setStep] = useState<AuthStep>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const googleButtonWrapper = useRef<HTMLDivElement>(null);
    const [googleBtnWidth, setGoogleBtnWidth] = useState<string>('300');

    /* ---------- GOOGLE BTN WIDTH ---------- */
    useEffect(() => {
        const resize = () => {
            if (googleButtonWrapper.current) {
                setGoogleBtnWidth(String(googleButtonWrapper.current.offsetWidth));
            }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    /* ---------- LOCATION STATE ---------- */
    useEffect(() => {
        if (location.state?.message) setMessage(location.state.message);
        if (location.state?.email) setEmail(location.state.email);
        if (location.state?.step) setStep(location.state.step);
    }, [location.state]);

    /* ---------- REDIRECT ---------- */
    useEffect(() => {
        if (!authLoading && user) {
            navigate(location.state?.returnUrl || '/dashboard', { replace: true });
        }
    }, [user, authLoading, navigate, location.state]);

    if (authLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-gray-400 animate-pulse">Loading...</div>
            </main>
        );
    }

    /* ---------- HANDLERS ---------- */

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setError('');
        setIsSubmitting(true);

        try {
            await login({ email, password });
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Invalid credentials'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setError('');
        setIsSubmitting(true);

        try {
            if (password.length < 8) {
                throw new Error('Password must be at least 8 characters');
            }
            await register({ name, email, password });
            setMessage('Account created successfully. Please log in.');
            setStep('login');
            setPassword('');
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Signup failed'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSuccess = async (credential: string) => {
        if (isSubmitting) return;

        setError('');
        setIsSubmitting(true);

        try {
            await googleLogin(credential);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Google login failed'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEmailContinue = (next: 'login' | 'signup') => {
        if (!email) return setError('Please enter your email address');
        if (!/\S+@\S+\.\S+/.test(email)) return setError('Invalid email address');

        setError('');
        setPassword('');
        setStep(next);
    };

    /* ---------- UI ---------- */

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-4 pt-24">
            <div className="w-full max-w-[420px] bg-[#121212] border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden">

                {/* Background glow effect for premium feel */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10">
                    {message && (
                        <div className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
                            {message}
                        </div>
                    )}

                    <div className="text-center mb-8">
                        <img src="/assets/logo.png" className="w-12 h-12 mx-auto mb-6 object-contain" alt="Logo" />
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                            {step === 'email' && 'Continue to WorkRaze'}
                            {step === 'login' && 'Welcome back'}
                            {step === 'signup' && 'Create your account'}
                        </h2>
                    </div>

                    {/* EMAIL STEP */}
                    {step === 'email' && (
                        <div className="space-y-5">
                            {error && <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded">{error}</div>}

                            <Input
                                label="Email address"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@work.com"
                                className="bg-[#1a1a1a] border-white/10 focus:border-white/20 h-11"
                                autoFocus
                            />

                            <div className="space-y-3 pt-2">
                                <Button
                                    onClick={() => handleEmailContinue('login')}
                                    className="w-full h-11 font-semibold text-base shadow-lg shadow-white/5"
                                    variant="primary"
                                >
                                    Login
                                </Button>

                                <Button
                                    onClick={() => handleEmailContinue('signup')}
                                    className="w-full h-11 border-white/10 hover:bg-white/5 text-gray-300"
                                    variant="outline"
                                >
                                    Sign Up
                                </Button>
                            </div>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-white/10"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">Or continue with</span>
                                <div className="flex-grow border-t border-white/10"></div>
                            </div>

                            <div ref={googleButtonWrapper} className="w-full flex justify-center">
                                <GoogleLogin
                                    onSuccess={c => c.credential && handleGoogleSuccess(c.credential)}
                                    onError={() => setError('Google login failed')}
                                    width={googleBtnWidth}
                                    theme="filled_blue"
                                    shape="pill"
                                    text="signin_with"
                                />
                            </div>
                        </div>
                    )}

                    {/* LOGIN */}
                    {step === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded">{error}</div>}

                            <div className="space-y-4">
                                <div className="p-3 bg-white/5 rounded-lg flex items-center justify-between">
                                    <span className="text-gray-300 text-sm">{email}</span>
                                    <button
                                        type="button"
                                        onClick={() => setStep('email')}
                                        className="text-primary hover:text-primary-hover text-sm font-medium"
                                    >
                                        Change
                                    </button>
                                </div>
                                <Input
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="bg-[#1a1a1a] border-white/10 focus:border-white/20 h-11"
                                />
                            </div>

                            <div className="pt-2">
                                <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-base font-bold">
                                    {isSubmitting ? 'Logging in…' : 'Login'}
                                </Button>
                                <Button variant="ghost" type="button" onClick={() => setStep('email')} className="w-full mt-2">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* SIGNUP */}
                    {step === 'signup' && (
                        <form onSubmit={handleSignup} className="space-y-6">
                            {error && <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded">{error}</div>}

                            <div className="space-y-4">
                                <div className="p-3 bg-white/5 rounded-lg flex items-center justify-between">
                                    <span className="text-gray-300 text-sm">{email}</span>
                                    <button
                                        type="button"
                                        onClick={() => setStep('email')}
                                        className="text-primary hover:text-primary-hover text-sm font-medium"
                                    >
                                        Change
                                    </button>
                                </div>
                                <Input
                                    label="Full Name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                    className="bg-[#1a1a1a] border-white/10 focus:border-white/20 h-11"
                                />
                                <Input
                                    label="Create Password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="bg-[#1a1a1a] border-white/10 focus:border-white/20 h-11"
                                />
                            </div>

                            <div className="pt-2">
                                <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-base font-bold">
                                    {isSubmitting ? 'Creating…' : 'Sign Up'}
                                </Button>
                                <Button variant="ghost" type="button" onClick={() => setStep('email')} className="w-full mt-2">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
};
