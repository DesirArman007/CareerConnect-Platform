import React, { useState, useRef } from 'react';
import { User, Mail, MessageSquare, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { feedbackApi } from "../services/feedback.api";

export const Feedback: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        <section className="py-20 sm:py-28 relative overflow-hidden bg-[#08080A]">
            {/* Warm ambient orange radial glows framing the card */}
            <div className="absolute left-1/2 -translate-x-[420px] top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-[#FF5500]/[0.08] blur-[120px] pointer-events-none" />
            <div className="absolute left-1/2 translate-x-[40px] top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-[#FF5500]/[0.08] blur-[120px] pointer-events-none" />

            <div className="max-w-xl sm:max-w-2xl mx-auto px-4 relative z-10">
                <div className="bg-[#121316] border border-white/[0.08] rounded-[24px] p-6 sm:p-10 shadow-2xl shadow-black/80">
                    {!submitted ? (
                        <>
                            {/* Heading & Subtitle */}
                            <div className="text-center mb-7">
                                <h2 className="text-2xl sm:text-[30px] font-bold tracking-tight text-white">
                                    Quick <span className="text-[#FF5500]">Check-in</span>
                                </h2>
                                <p className="text-[#8E929C] text-sm sm:text-base mt-2 font-normal">
                                    Help us make your job search even better.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-4 text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-3.5">
                                {/* Name Input */}
                                <div className="relative flex items-center bg-[#17181D] border border-white/[0.08] rounded-xl px-4 py-3.5 focus-within:border-[#FF5500]/50 transition-colors">
                                    <User className="w-5 h-5 text-[#8E929C] shrink-0" strokeWidth={1.8} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your Name"
                                        className="w-full bg-transparent pl-3 text-sm text-white placeholder:text-[#8E929C] focus:outline-none"
                                        required
                                    />
                                </div>

                                {/* Email Input */}
                                <div className="relative flex items-center bg-[#17181D] border border-white/[0.08] rounded-xl px-4 py-3.5 focus-within:border-[#FF5500]/50 transition-colors">
                                    <Mail className="w-5 h-5 text-[#8E929C] shrink-0" strokeWidth={1.8} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email (Optional)"
                                        className="w-full bg-transparent pl-3 text-sm text-white placeholder:text-[#8E929C] focus:outline-none"
                                    />
                                </div>

                                {/* Thoughts Textarea Field */}
                                <div
                                    onClick={() => textareaRef.current?.focus()}
                                    className="relative bg-[#17181D] border border-white/[0.08] rounded-xl p-4 focus-within:border-[#FF5500]/50 transition-colors cursor-text min-h-[110px] flex flex-col justify-between"
                                >
                                    <div className="flex items-start gap-3">
                                        <MessageSquare className="w-5 h-5 text-[#8E929C] mt-0.5 shrink-0" strokeWidth={1.8} />
                                        <div className="flex-1">
                                            <div className="text-sm text-[#9B9EA7] font-normal leading-tight select-none">
                                                Any thoughts?
                                            </div>
                                            <textarea
                                                ref={textareaRef}
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="I wish I could filter by..."
                                                rows={2}
                                                required
                                                className="w-full bg-transparent border-none p-0 mt-1.5 text-sm text-white placeholder:text-[#585B65] focus:outline-none focus:ring-0 resize-none leading-relaxed"
                                            />
                                        </div>
                                    </div>
                                    {/* Resize corner grip indicator matching screenshot */}
                                    <div className="flex justify-end pt-1">
                                        <svg className="w-3 h-3 text-[#4A4D57] pointer-events-none select-none" viewBox="0 0 10 10" fill="none">
                                            <path d="M8 2L2 8M8 5.5L5.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || !name}
                                    className="w-full h-12 rounded-xl text-white font-medium text-[15px] bg-gradient-to-r from-[#FF6B26] via-[#FF5818] to-[#FF4500] hover:from-[#FF7835] hover:to-[#FF5510] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_-2px_rgba(255,85,0,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Sharing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Share Thoughts</span>
                                            <ArrowRight className="w-4 h-4" strokeWidth={2} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Footer helper text */}
                            <p className="text-center text-xs sm:text-[13px] text-[#717684] mt-5">
                                Your feedback helps us build a better experience.
                            </p>
                        </>
                    ) : (
                        <div className="py-8 text-center animate-in fade-in zoom-in duration-300">
                            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-emerald-400">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
                            <p className="text-[#8E929C] text-sm mb-6">
                                Your feedback helps us build a better experience.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSubmitted(false);
                                    setName('');
                                    setEmail('');
                                    setMessage('');
                                }}
                                className="text-xs text-neutral-400 hover:text-white underline transition-colors cursor-pointer"
                            >
                                Send another response
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
