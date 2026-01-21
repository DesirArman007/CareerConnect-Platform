import React, { useState, useEffect } from 'react';
import { Hero } from '../Hero';
import { JobList } from '../JobList';
import { Stats } from '../Stats';
import { Testimonials } from '../Testimonials';
import { Feedback } from '../Feedback';
import { CTA } from '../CTA';
import { jobs as jobApi } from '../../services/api';
import { Job } from '../../types';

export const LandingPage: React.FC = () => {
    const [recentJobs, setRecentJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                // Use getRecent endpoint
                const data = await jobApi.getRecent();
                setRecentJobs(data);
            } catch (error) {
                console.error("Failed to fetch recent jobs", error);

                // Fallback to getAll and slice if getRecent fails (optional robustness)
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
        <main>
            <Hero />
            <Stats />
            <JobList
                jobs={recentJobs.slice(0, 9)}
                showViewAll={true}
                isLoading={isLoading}
            />
            <Testimonials />
            <CTA />
            <Feedback />
        </main>
    );
};
