import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Zap, Layout, MessageSquare, CheckCircle2, User, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { feedback as feedbackApi } from "../services/api";
import { Feedback as FeedbackType } from '../types';

export const Feedback: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [speed, setSpeed] = useState<string | null>(null);
    const [clarity, setClarity] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    // Mapping Helpers: UI String -> Backend Enum
    const mapSpeedToBackend = (val: string | null): FeedbackType['searchExperience'] | undefined => {
        if (val === 'Slower / Harder') return 'slower_harder';
        if (val === 'About the same') return 'same';
        if (val === 'Faster & Smoother') return 'faster_smoother';
        return undefined;
    };

    const mapClarityToBackend = (val: string | null): FeedbackType['clarityFeeling'] | undefined => {
        if (val === 'No different') return 'no_difference';
        if (val === 'A bit better') return 'bit_better';
        if (val === 'Much clearer') return 'much_clearer';
        return undefined;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Split name into First/Last
            const nameParts = name.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');

            // Prepare Payload
            const payload = {
                firstName,
                lastName,
                email: email || undefined, // Send undefined if empty string
                searchExperience: mapSpeedToBackend(speed),
                clarityFeeling: mapClarityToBackend(clarity),
                message: message
            };

            // Call API
            await feedbackApi.create(payload);
            setSubmitted(true);

        } catch (err: any) {
            console.error('Feedback failed:', err);
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-12 sm:py-24 bg-black relative border-t border-white/5">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[150px] sm:h-[300px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="text-center mb-6 sm:mb-10">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 leading-tight">Did This Feel Simpler Than Your Usual Job Search?</h2>
                    <p className="text-gray-400 text-sm sm:text-base">We're trying to streamline the chaos. Tell us if we're hitting the mark.</p>
                </div>

                <Card className="p-4 sm:p-8 bg-surface/50 backdrop-blur-sm">
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

                            {/* Error Message Display */}
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Jane Doe"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        Email <span className="text-gray-500 text-xs font-normal ml-1">(Optional)</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="jane@example.com"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                                        // Removed 'required'
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Speed/Efficiency Question */}
                            <div className="space-y-3 sm:space-y-4">
                                <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-accent flex-shrink-0" />
                                    <span>Compared to your usual search, how did this feel?</span>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
                                    {['Slower / Harder', 'About the same', 'Faster & Smoother'].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setSpeed(opt)}
                                            disabled={loading}
                                            className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm border transition-all duration-200 text-left sm:text-center ${speed === opt
                                                ? 'bg-accent/10 border-accent text-white'
                                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mental Load Question */}
                            <div className="space-y-3 sm:space-y-4">
                                <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Layout className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    <span>Did you feel less overwhelmed?</span>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
                                    {['No different', 'A bit better', 'Much clearer'].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setClarity(opt)}
                                            disabled={loading}
                                            className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm border transition-all duration-200 text-left sm:text-center ${clarity === opt
                                                ? 'bg-blue-500/20 border-blue-500/50 text-white'
                                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Open Text */}
                            <div className="space-y-3 sm:space-y-4">
                                <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span>Any friction, bugs, or wishes?</span>
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={loading}
                                    placeholder="Example: I couldn't find the salary filter..."
                                    className="w-full h-20 sm:h-24 bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all resize-none"
                                />
                            </div>

                            <div className="flex justify-center sm:justify-end">
                                <Button
                                    type="submit"
                                    className="w-full sm:w-auto"
                                    // Removed '!email' check here
                                    disabled={loading || !name || (!speed && !clarity && !message)}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Feedback'
                                    )}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="py-8 sm:py-12 text-center animate-fade-in-up">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Thanks for your help!</h3>
                            <p className="text-gray-400 text-sm sm:text-base">We're building this for you. Your input directly shapes what we ship next.</p>
                        </div>
                    )}
                </Card>
            </div>
        </section>
    );
};