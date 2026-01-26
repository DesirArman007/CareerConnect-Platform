import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, user, isLoading: authLoading, googleLogin } = useAuth();
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
        <main className="min-h-screen pt-32 pb-8 px-4 flex items-start md:items-center justify-center overflow-y-auto relative">
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
                    <div className="w-full flex justify-center">
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                if (credentialResponse.credential) {
                                    try {
                                        await googleLogin(credentialResponse.credential);
                                        navigate("/dashboard");
                                    } catch (err) {
                                        setError("Google Login failed. Please try again.");
                                    }
                                }
                            }}
                            onError={() => {
                                setError("Google Login Failed");
                            }}
                            theme="filled_black"
                            width="250"
                            text="continue_with"
                            shape="pill"

                        />
                    </div>

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
