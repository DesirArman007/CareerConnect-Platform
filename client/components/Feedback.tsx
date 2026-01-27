import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Zap, Layout, MessageSquare, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { feedback as feedbackApi } from "../services/api";

export const Feedback: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Split name into First/Last
            const nameParts = name.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');

            const payload = {
                firstName,
                lastName,
                email: email || undefined,
                message: message
            };

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
        <section className="py-16 sm:py-24 bg-black relative border-t border-white/5">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-xl mx-auto px-4 relative z-10">
                {!submitted ? (
                    <Card className="p-1 bg-gradient-to-b from-white/10 to-transparent rounded-2xl border-0 shadow-2xl">
                        <div className="bg-[#0A0A0A] rounded-xl p-6 sm:p-8 space-y-8">
                            <div className="text-center space-y-2">
                                <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center justify-center gap-2">
                                    <Sparkles className="w-5 h-5 text-accent" />
                                    Quick Check-in
                                </h2>
                                <p className="text-gray-400 text-sm">Help us make your job search even better.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded">
                                        {error}
                                    </div>
                                )}

                                {/* Simpler Inputs */}
                                <div className="grid grid-cols-1 gap-4  ">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your Name"
                                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors"
                                        required
                                    />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email (Optional)"
                                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400 block ml-1">Any thoughts?</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="I wish I could filter by..."
                                        className="w-full h-20 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent/50 transition-colors resize-none"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading || !name}
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sharing...</>
                                    ) : (
                                        'Share Thoughts'
                                    )}
                                </Button>
                            </form>
                        </div>
                    </Card>
                ) : (
                    <div className="py-12 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-green-500/20">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                        <p className="text-gray-400">Your feedback helps us build a better platform.</p>
                    </div>
                )}
            </div>
        </section>
    );
};