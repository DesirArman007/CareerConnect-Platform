import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Field error type
interface FieldErrors {
    firstName?: string;
    email?: string;
    password?: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const { register, user, isLoading: authLoading } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const { googleLogin } = useAuth();



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

    const clearForm = () => {
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setFieldErrors({});
    };

    // Clear specific field error when user starts typing
    const handleFieldChange = (
        field: 'firstName' | 'email' | 'password',
        value: string,
        setter: React.Dispatch<React.SetStateAction<string>>
    ) => {
        setter(value);
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // Validate all fields
    const validateForm = (): boolean => {
        const errors: FieldErrors = {};
        let isValid = true;

        // First Name validation (required)
        if (!firstName.trim()) {
            errors.firstName = 'First name is required';
            isValid = false;
        }

        // Email validation (required + format)
        if (!email.trim()) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!EMAIL_REGEX.test(email)) {
            errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // Password validation (required + min length)
        if (!password) {
            errors.password = 'Password is required';
            isValid = false;
        } else if (password.length < MIN_PASSWORD_LENGTH) {
            errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate form before making API call
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            await register({
                name: `${firstName} ${lastName}`.trim(),
                email,
                password
            });

            // Success! Clear form and show success message
            clearForm();
            setSuccess('Account created successfully! Redirecting to login...');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err: any) {
            console.error('Register error:', err);
            const statusCode = err.response?.status;
            const msg = err.response?.data?.message;

            // Handle 409 Conflict - User already exists
            if (statusCode === 409) {
                setError('User already exists. Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
                return;
            }

            // Handle other errors
            if (typeof msg === 'string') {
                setError(msg);
            } else if (msg && typeof msg === 'object') {
                setError(Object.values(msg).join(', ') || 'Registration failed.');
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };





    return (
        <main className="min-h-screen pt-32 pb-8 px-4 flex items-start md:items-center justify-center overflow-y-auto">
            {/* Back Button - hidden on mobile */}
            <button
                onClick={() => navigate('/')}
                className="hidden md:flex fixed top-24 left-6 lg:left-12 items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm z-10"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
            </button>

            <Card className="max-w-md w-full p-4 sm:p-6 md:p-8 mx-auto bg-surface/80 border-white/10 backdrop-blur-sm">
                <div className="text-center mb-4 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60 mb-1 sm:mb-2">Create an Account</h1>
                    <p className="text-gray-400 text-xs sm:text-sm">Join the future of job hunting</p>
                </div>

                <div className="space-y-3 sm:space-y-4">
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

                    <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-3 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                                {success}
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <Input
                                    placeholder="First Name *"
                                    value={firstName}
                                    onChange={(e) => handleFieldChange('firstName', e.target.value, setFirstName)}
                                    className={fieldErrors.firstName ? 'border-red-500' : ''}
                                />
                                {fieldErrors.firstName && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</p>
                                )}
                            </div>
                            <div>
                                <Input
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Input
                                type="email"
                                placeholder="m@example.com"
                                label="Email *"
                                value={email}
                                onChange={(e) => handleFieldChange('email', e.target.value, setEmail)}
                                className={fieldErrors.email ? 'border-red-500' : ''}
                            />
                            {fieldErrors.email && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                            )}
                        </div>

                        <div>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                label="Password *"
                                value={password}
                                onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
                                className={fieldErrors.password ? 'border-red-500' : ''}
                            />
                            {fieldErrors.password && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">Minimum 6 characters</p>
                        </div>

                        <Button type="submit" variant="primary" className="w-full mt-2" disabled={isLoading}>
                            {isLoading ? 'Signing up...' : 'Sign Up'}
                        </Button>
                    </form>

                    <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-white hover:underline">
                            Log in
                        </Link>
                    </div>
                </div>
            </Card>
        </main>
    );
};
