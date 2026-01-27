import React, { useState, useEffect } from 'react';
import { Hero } from '../Hero';
import { Stats } from '../Stats';
import { JobList } from '../JobList';
import Testimonials from '../Testimonials';
import { Feedback } from '../Feedback';
import { CTA } from '../CTA';
import { jobs as jobApi } from '../../services/api';
import { Job } from '../../types';

export const HomePage: React.FC = () => {
    const [recentJobs, setRecentJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const data = await jobApi.getRecent();
                setRecentJobs(data);
            } catch (error) {
                console.error("Failed to fetch recent jobs", error);
                // Fallback
                try {
                    const response = await jobApi.getAll(1, 6);
                    setRecentJobs(response.jobs || []);
                } catch (e) { console.error("Fallback failed", e); }
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecent();
    }, []);

    return (
        <main className="min-h-screen bg-background">
            <Hero jobs={recentJobs} />
            <Stats />

            <div className="py-8">
                <JobList
                    jobs={recentJobs.slice(0, 9)}
                    showViewAll={true}
                    isLoading={isLoading}
                    title="Apply to these roles"
                    subtitle="Direct applications available now. No third-party recruiters."
                />
            </div>

            <Testimonials />
            <Feedback />
        </main>
    );
};
