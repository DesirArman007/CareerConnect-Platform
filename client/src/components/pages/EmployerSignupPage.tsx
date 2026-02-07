import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ArrowLeft, ArrowRight, Building2, User, Briefcase } from 'lucide-react';
import { authApi } from '../../services/auth.api';
import toast from 'react-hot-toast';

type Step = 'personal' | 'company';

const INDUSTRIES = [
    'Technology',
    'Finance',
    'Healthcare',
    'E-commerce',
    'Education',
    'Manufacturing',
    'Consulting',
    'Media',
    'Real Estate',
    'Other'
];

const COMPANY_SIZES = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+'
];

export const EmployerSignupPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [step, setStep] = useState<Step>('personal');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Personal info
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Company info
    const [companyName, setCompanyName] = useState('');
    const [website, setWebsite] = useState('');
    const [industry, setIndustry] = useState('');
    const [size, setSize] = useState('');
    const [companyLocation, setCompanyLocation] = useState('');

    const validatePersonal = () => {
        if (!name.trim()) return 'Name is required';
        if (!email.trim()) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email address';
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (password !== confirmPassword) return 'Passwords do not match';
        return null;
    };

    const validateCompany = () => {
        if (!companyName.trim()) return 'Company name is required';
        if (!website.trim()) return 'Website is required';
        if (!industry) return 'Industry is required';
        if (!size) return 'Company size is required';
        if (!companyLocation.trim()) return 'Location is required';
        return null;
    };

    const handleNextStep = () => {
        const err = validatePersonal();
        if (err) {
            setError(err);
            return;
        }
        setError('');
        setStep('company');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        const err = validateCompany();
        if (err) {
            setError(err);
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            await authApi.registerEmployer({
                name,
                email,
                password,
                companyName,
                website,
                industry,
                size,
                location: companyLocation
            });

            toast.success('Account created! Please login to continue.');
            navigate('/login', {
                state: {
                    message: 'Employer account created successfully. Please login.',
                    email
                }
            });
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Registration failed'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-4 pt-24">
            <div className="w-full max-w-[480px] bg-[#121212] border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden">

                {/* Background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <Briefcase className="w-7 h-7 text-white" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                            {step === 'personal' ? 'Create Employer Account' : 'Company Details'}
                        </h2>
                        <p className="text-gray-400 mt-2 text-sm">
                            {step === 'personal'
                                ? 'Start posting jobs and find great talent'
                                : 'Tell us about your company'}
                        </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${step === 'personal'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-white/5 text-gray-500'
                            }`}>
                            <User className="w-4 h-4" />
                            Personal
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-600" />
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${step === 'company'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-white/5 text-gray-500'
                            }`}>
                            <Building2 className="w-4 h-4" />
                            Company
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Personal Info */}
                    {step === 'personal' && (
                        <div className="space-y-5">
                            <Input
                                label="Full Name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="John Doe"
                                className="bg-[#1a1a1a] border-white/10 focus:border-white/20 h-11"
                                autoFocus
                            />
                            <Input
                                label="Work Email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="john@company.com"
                                className="bg-[#1a1a1a] border-white/10 focus:border-white/20 h-11"
                            />
                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Min 8 characters"
                                className="bg-[#1a1a1a] border-white/10 focus:border-white/20 h-11"
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                className="bg-[#1a1a1a] border-white/10 focus:border-white/20 h-11"
                            />

                            <div className="pt-4">
                                <Button
                                    onClick={handleNextStep}
                                    className="w-full h-11 font-semibold text-base"
                                >
                                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>

                            <p className="text-center text-gray-500 text-sm">
                                Already have an account?{' '}
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-orange-400 hover:text-orange-300"
                                >
                                    Login
                                </button>
                            </p>
                        </div>
                    )}

                    {/* Step 2: Company Info */}
                    {step === 'company' && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Company Name"
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                placeholder="Acme Inc."
                                className="bg-[#1a1a1a] border-white/10 focus:border-white/20 h-11"
                                autoFocus
                            />
                            <Input
                                label="Website"
                                value={website}
                                onChange={e => setWebsite(e.target.value)}
                                placeholder="https://company.com"
                                className="bg-[#1a1a1a] border-white/10 focus:border-white/20 h-11"
                            />

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Industry</label>
                                <select
                                    value={industry}
                                    onChange={e => setIndustry(e.target.value)}
                                    className="w-full h-11 px-4 rounded-lg bg-[#1a1a1a] border border-white/10 text-white focus:border-white/20 focus:outline-none"
                                >
                                    <option value="">Select industry</option>
                                    {INDUSTRIES.map(ind => (
                                        <option key={ind} value={ind}>{ind}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Company Size</label>
                                <select
                                    value={size}
                                    onChange={e => setSize(e.target.value)}
                                    className="w-full h-11 px-4 rounded-lg bg-[#1a1a1a] border border-white/10 text-white focus:border-white/20 focus:outline-none"
                                >
                                    <option value="">Select size</option>
                                    {COMPANY_SIZES.map(s => (
                                        <option key={s} value={s}>{s} employees</option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Location"
                                value={companyLocation}
                                onChange={e => setCompanyLocation(e.target.value)}
                                placeholder="Bangalore, India"
                                className="bg-[#1a1a1a] border-white/10 focus:border-white/20 h-11"
                            />

                            <div className="pt-4 space-y-3">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-11 font-semibold text-base"
                                >
                                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setStep('personal')}
                                    className="w-full"
                                >
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
