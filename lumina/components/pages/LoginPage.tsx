import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, user, isLoading: authLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Redirect authenticated users to dashboard
    if (authLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </main>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login({ email, password });
            navigate('/dashboard');
        } catch (err: any) {
            console.error('Login error:', err);
            const msg = err.response?.data?.message;
            if (typeof msg === 'string') {
                setError(msg);
            } else if (msg && typeof msg === 'object') {
                // If message is the validation object itself
                setError(Object.values(msg).join(', ') || 'Login failed.');
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-4 relative">
            {/* Back Button - hidden on mobile */}
            <button
                onClick={() => navigate('/')}
                className="hidden sm:flex absolute top-24 left-6 md:left-12 items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
            </button>

            <Card className="max-w-md w-full p-5 sm:p-8 bg-surface/80 border-white/10 backdrop-blur-sm">
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60 mb-2">Welcome Back</h1>
                    <p className="text-gray-400 text-xs sm:text-sm">Log in to continue your career journey</p>
                </div>

                <div className="space-y-4">
                    <Button variant="outline" className="w-full flex justify-center items-center gap-2 sm:gap-3 h-10 sm:h-12 text-xs sm:text-sm" disabled>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        <span className="hidden sm:inline">Continue with Google (Coming Soon)</span>
                        <span className="sm:hidden">Google (Coming Soon)</span>
                    </Button>

                    <div className="relative my-4 sm:my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-surface px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                {error}
                            </div>
                        )}
                        <Input
                            type="email"
                            placeholder="m@example.com"
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            type="password"
                            placeholder="••••••••"
                            label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <div className="flex justify-end">
                            <Link to="#" className="text-xs text-brand-primary hover:text-white transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Log In'}
                        </Button>
                    </form>

                    <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-white hover:underline">
                            Sign up
                        </Link>
                    </div>
                </div>
            </Card>
        </main>
    );
};
