import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Zap, Layout, MessageSquare, CheckCircle2, User, Mail } from 'lucide-react';

export const Feedback: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [speed, setSpeed] = useState<string | null>(null);
  const [clarity, setClarity] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    setTimeout(() => setSubmitted(true), 500);
  };

  return (
    <section className="py-24 bg-black relative border-t border-white/5">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 relative z-10">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold mb-3">Did This Feel Simpler Than Your Usual Job Search?</h2>
                <p className="text-gray-400">We're trying to streamline the chaos. Tell us if we're hitting the mark.</p>
            </div>

            <Card className="p-8 bg-surface/50 backdrop-blur-sm">
                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    Email
                                </label>
                                <input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="jane@example.com"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Speed/Efficiency Question */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-accent" />
                                Compared to your usual search, how did this feel?
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {['Slower / Harder', 'About the same', 'Faster & Smoother'].map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setSpeed(opt)}
                                        className={`px-4 py-3 rounded-lg text-sm border transition-all duration-200 ${
                                            speed === opt 
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
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Layout className="w-4 h-4 text-blue-400" />
                                Did you feel less overwhelmed?
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {['No different', 'A bit better', 'Much clearer'].map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setClarity(opt)}
                                        className={`px-4 py-3 rounded-lg text-sm border transition-all duration-200 ${
                                            clarity === opt 
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
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-gray-400" />
                                Any friction, bugs, or wishes?
                            </label>
                            <textarea 
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Example: I couldn't find the salary filter..."
                                className="w-full h-24 bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all resize-none"
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={!name || !email || (!speed && !clarity && !feedback)}>
                                Send Feedback
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="py-12 text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Thanks for your help!</h3>
                        <p className="text-gray-400">We're building this for you. Your input directly shapes what we ship next.</p>
                    </div>
                )}
            </Card>
        </div>
    </section>
  );
};