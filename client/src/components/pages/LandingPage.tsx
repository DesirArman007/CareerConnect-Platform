import React, { useState, useEffect } from 'react';
import { Hero } from '../Hero';
import { JobList } from '../JobList';
import { Stats } from '../Stats';
import Testimonials from '../Testimonials';
import { Feedback } from '../Feedback';
import { CTA } from '../CTA';
import { jobApi } from '../../services/jobs.api';
import { Job } from '../../types';

export const LandingPage: React.FC = () => {
    const [recentJobs, setRecentJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecentJobs = async () => {
            setIsLoading(true);

            try {
                // ✅ Primary: backend-supported endpoint
                const response = await jobApi.getNew({
                    page: 1,
                    limit: 9,
                    days: 7,
                });

                setRecentJobs(response.data.jobs);
            } catch (error) {
                console.error('Failed to fetch recent jobs, falling back', error);

                // ✅ Fallback: generic listing
                try {
                    const fallback = await jobApi.getAll({
                        page: 1,
                        limit: 9,
                    });

                    setRecentJobs(fallback.data.jobs);
                } catch (fallbackError) {
                    console.error('Fallback fetch failed', fallbackError);
                    setRecentJobs([]);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecentJobs();
    }, []);

    return (
        <main>
            <Hero />
            <Stats />

            <JobList
                jobs={recentJobs}
                showViewAll={true}
                isLoading={isLoading}
            />

            <Testimonials />
            <CTA />
            <Feedback />
        </main>
    );
};
