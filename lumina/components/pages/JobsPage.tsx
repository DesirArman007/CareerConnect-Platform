import React, { useState, useEffect } from 'react';
import { JobList } from '../JobList';
import { Job } from '../../types';
import { jobs as jobApi, PaginationInfo } from '../../services/api';

const ITEMS_PER_PAGE = 15;

export const JobsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0,
        limit: ITEMS_PER_PAGE
    });

    // For filter dropdowns - store all unique values
    const [allDepartments, setAllDepartments] = useState<string[]>([]);
    const [allLocations, setAllLocations] = useState<string[]>([]);

    // Fetch filter options on mount (larger batch for dropdowns)
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const filterJobs = await jobApi.getAllForFilters();
                const depts = Array.from(new Set(filterJobs.map(j => j.department).filter(Boolean))) as string[];
                const locs = Array.from(new Set(filterJobs.map(j => j.location).filter(Boolean))) as string[];
                setAllDepartments(depts);
                setAllLocations(locs);
            } catch (error) {
                console.error("Failed to fetch filter options", error);
            }
        };
        fetchFilters();
    }, []);

    // Fetch jobs with server-side pagination
    useEffect(() => {
        const fetchJobs = async () => {
            setIsLoading(true);
            try {
                let response;
                const trimmedQuery = searchQuery.trim();

                // Only call search API if there's an actual query string
                if (trimmedQuery && trimmedQuery.length > 0) {
                    response = await jobApi.search(trimmedQuery, currentPage, ITEMS_PER_PAGE);
                } else {
                    // No search query - use normal listing
                    response = await jobApi.getAll(currentPage, ITEMS_PER_PAGE);
                }

                // Ensure jobs is always an array
                let fetchedJobs = Array.isArray(response.jobs) ? response.jobs : [];

                // Apply client-side filtering for department/location
                // (if backend doesn't support these filters)
                if (selectedDepartment || selectedLocation) {
                    fetchedJobs = fetchedJobs.filter(job => {
                        const matchDept = selectedDepartment ? job.department === selectedDepartment : true;
                        const matchLoc = selectedLocation ? job.location === selectedLocation : true;
                        return matchDept && matchLoc;
                    });
                }

                setJobs(fetchedJobs);

                // Ensure pagination has valid values
                setPagination({
                    currentPage: response.pagination?.currentPage || currentPage,
                    totalPages: response.pagination?.totalPages || 1,
                    totalJobs: response.pagination?.totalJobs || fetchedJobs.length,
                    limit: response.pagination?.limit || ITEMS_PER_PAGE
                });
            } catch (error) {
                console.error("Failed to fetch jobs", error);
                setJobs([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalJobs: 0,
                    limit: ITEMS_PER_PAGE
                });
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchJobs();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, currentPage, selectedDepartment, selectedLocation]);

    // Reset page on filter/search change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedDepartment, selectedLocation, searchQuery]);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <main className="pt-20">
            {/* Search and Filter Section */}
            <div className="bg-surface/30 border-b border-white/5 py-8">
                <div className="max-w-7xl mx-auto px-6 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Search by job title, company, or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                        />
                        <div className="flex gap-4">
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 transition-colors appearance-none min-w-[200px]"
                            >
                                <option value="">All Departments</option>
                                {allDepartments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 transition-colors appearance-none min-w-[200px]"
                            >
                                <option value="">All Locations</option>
                                {allLocations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Results count */}
                    {!isLoading && (
                        <div className="text-sm text-gray-400">
                            Showing {jobs.length} of {pagination.totalJobs} jobs
                            {pagination.totalPages > 1 && ` • Page ${currentPage} of ${pagination.totalPages}`}
                        </div>
                    )}
                </div>
            </div>

            <JobList
                jobs={jobs}
                isLoading={isLoading}
                showViewAll={false}
                pagination={{
                    currentPage,
                    totalPages: pagination.totalPages,
                    onPageChange: handlePageChange
                }}
            />
        </main>
    );
};
