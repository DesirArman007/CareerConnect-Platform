import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { ArrowLeft, Briefcase, MapPin, Clock, Users, Send } from 'lucide-react';
import { jobApi, CreateJobData } from '../../services/jobs.api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EMPLOYMENT_TYPES = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'temporary', label: 'Temporary' },
    { value: 'freelance', label: 'Freelance' },
];

const DEPARTMENTS = [
    'Engineering',
    'Product',
    'Design',
    'Data',
    'Sales',
    'Marketing',
    'Operations',
    'Finance',
    'HR',
    'Legal',
    'Customer Success',
    'Other'
];

export const CreateJobPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [employmentType, setEmploymentType] = useState('');
    const [department, setDepartment] = useState('');
    const [expMin, setExpMin] = useState('0');
    const [expMax, setExpMax] = useState('0');

    // Auth check and redirect
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login', {
                state: {
                    message: 'Please login to post a job',
                    returnUrl: '/employer/post-job'
                }
            });
        } else if (!authLoading && user && user.role !== 'employer') {
            toast.error('Only employers can post jobs');
            navigate('/dashboard');
        }
    }, [user, authLoading, navigate]);

    const validate = (): string | null => {
        if (!title.trim()) return 'Job title is required';
        if (!description.trim()) return 'Job description is required';
        if (description.length < 100) return 'Description must be at least 100 characters';
        if (!location.trim()) return 'Location is required';
        if (!employmentType) return 'Employment type is required';
        if (!department) return 'Department is required';

        const minYears = parseInt(expMin);
        const maxYears = parseInt(expMax);
        if (isNaN(minYears) || minYears < 0) return 'Invalid minimum experience';
        if (isNaN(maxYears) || maxYears < 0) return 'Invalid maximum experience';
        if (minYears > maxYears) return 'Min experience cannot be greater than max';

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            const jobData: CreateJobData = {
                title,
                description,
                location,
                employment_type: employmentType,
                department,
                experience_min_years: parseInt(expMin),
                experience_max_years: parseInt(expMax)
            };

            await jobApi.createJob(jobData);
            toast.success('Job posted successfully!');
            navigate('/dashboard');
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Failed to post job'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-gray-400 animate-pulse">Loading...</div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white pt-24 pb-16 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold">Post a New Job</h1>
                    <p className="text-gray-400 mt-2">Fill in the details below to create a job posting</p>
                </div>

                <Card className="p-6 md:p-8">
                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Job Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <Briefcase className="w-4 h-4 inline mr-2" />
                                Job Title *
                            </label>
                            <Input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Senior Full Stack Developer"
                                className="bg-[#1a1a1a] border-white/10 focus:border-white/20 h-12"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <MapPin className="w-4 h-4 inline mr-2" />
                                Location *
                            </label>
                            <Input
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                placeholder="e.g. Bangalore, India or Remote"
                                className="bg-[#1a1a1a] border-white/10 focus:border-white/20 h-12"
                            />
                        </div>

                        {/* Employment Type & Department */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <Clock className="w-4 h-4 inline mr-2" />
                                    Employment Type *
                                </label>
                                <select
                                    value={employmentType}
                                    onChange={e => setEmploymentType(e.target.value)}
                                    className="w-full h-12 px-4 rounded-lg bg-[#1a1a1a] border border-white/10 text-white focus:border-white/20 focus:outline-none"
                                >
                                    <option value="">Select type</option>
                                    {EMPLOYMENT_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <Users className="w-4 h-4 inline mr-2" />
                                    Department *
                                </label>
                                <select
                                    value={department}
                                    onChange={e => setDepartment(e.target.value)}
                                    className="w-full h-12 px-4 rounded-lg bg-[#1a1a1a] border border-white/10 text-white focus:border-white/20 focus:outline-none"
                                >
                                    <option value="">Select department</option>
                                    {DEPARTMENTS.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Experience */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Experience Required (years)
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    type="number"
                                    min="0"
                                    value={expMin}
                                    onChange={e => setExpMin(e.target.value)}
                                    placeholder="Min"
                                    className="bg-[#1a1a1a] border-white/10 focus:border-white/20 h-12"
                                />
                                <Input
                                    type="number"
                                    min="0"
                                    value={expMax}
                                    onChange={e => setExpMax(e.target.value)}
                                    placeholder="Max"
                                    className="bg-[#1a1a1a] border-white/10 focus:border-white/20 h-12"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Job Description *
                            </label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity great..."
                                rows={8}
                                className="w-full px-4 py-3 rounded-lg bg-[#1a1a1a] border border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 focus:outline-none resize-none"
                            />
                            <p className="text-gray-500 text-xs mt-1">
                                {description.length}/100 characters minimum
                            </p>
                        </div>

                        {/* Submit */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 font-semibold text-base"
                            >
                                {isSubmitting ? (
                                    'Posting...'
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Post Job
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </main>
    );
};
