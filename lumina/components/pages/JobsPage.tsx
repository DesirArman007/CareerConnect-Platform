import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { JobList } from '../JobList';
import { Job } from '../../types';
import { jobs as jobApi, PaginationInfo } from '../../services/api';
import { Search, X, Filter } from 'lucide-react';
import { normalizeLocation, getUniqueLocations } from '../../services/locationService';

const ITEMS_PER_PAGE = 15;
const DEBOUNCE_DELAY = 300;



// Simplified department categories
const DEPARTMENTS = [
    { value: '', label: 'All Departments' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Product', label: 'Product' },
    { value: 'Design', label: 'Design' },
    { value: 'Data', label: 'Data & Analytics' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Finance', label: 'Finance' },
    { value: 'HR', label: 'Human Resources' },
    { value: 'Legal', label: 'Legal' },
    { value: 'Customer', label: 'Customer Success' },
    { value: 'Other', label: 'Other' },
];

// Employment type options
const EMPLOYMENT_TYPES = [
    { value: '', label: 'All Types' },
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Internship', label: 'Internship' },
];

const EXPERIENCE_LEVELS = [
    { value: '', label: 'All Levels' },
    { value: 'entry', label: 'Entry Level (0-2y)' },
    { value: 'mid', label: 'Mid Level (2-5y)' },
    { value: 'senior', label: 'Senior (5y+)' },
    { value: 'director', label: 'Director (8y+)' },
];

export const JobsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize state from URL params
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedDepartment, setSelectedDepartment] = useState(searchParams.get('department') || '');
    const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
    const [selectedEmploymentType, setSelectedEmploymentType] = useState(searchParams.get('type') || '');
    const [selectedExperienceLevel, setSelectedExperienceLevel] = useState(searchParams.get('experience_level') || '');

    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0,
        limit: ITEMS_PER_PAGE
    });

    // For location filter - still fetch dynamically
    const [allLocations, setAllLocations] = useState<string[]>([]);

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Fetch location options on mount (departments are now predefined)
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const filterJobs = await jobApi.getAllForFilters();

                // ✅ Use the service to get clean, unique locations
                const normalizedLocations = getUniqueLocations(filterJobs);
                setAllLocations(normalizedLocations);
            } catch (error) {
                console.error("Failed to fetch filter options", error);
            }
        };
        fetchFilters();
    }, []);

    // Sync state with URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (selectedDepartment) params.set('department', selectedDepartment);
        if (selectedLocation) params.set('location', selectedLocation);
        if (selectedEmploymentType) params.set('type', selectedEmploymentType);
        if (selectedExperienceLevel) params.set('experience_level', selectedExperienceLevel);
        if (currentPage > 1) params.set('page', currentPage.toString());

        setSearchParams(params, { replace: true });
    }, [searchQuery, selectedDepartment, selectedLocation, selectedEmploymentType, currentPage, setSearchParams]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
                setSearchQuery('');
                searchInputRef.current?.blur();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Main fetch function with abort controller
    const fetchJobs = useCallback(async (
        query: string,
        page: number,
        department: string,
        location: string,
        employmentType: string,
        experienceLevel: string,
        signal: AbortSignal
    ) => {
        setIsLoading(true);
        try {
            const trimmedQuery = query.trim();

            let response;

            if (trimmedQuery && trimmedQuery.length > 0) {
                response = await jobApi.search(trimmedQuery, page, ITEMS_PER_PAGE, department, location, employmentType, experienceLevel, signal);
            } else {
                response = await jobApi.getAll(page, ITEMS_PER_PAGE, department, location, employmentType, experienceLevel, signal);
            }

            const fetchedJobs = Array.isArray(response.jobs) ? response.jobs : [];

            setJobs(fetchedJobs);

            setPagination({
                currentPage: response.pagination?.currentPage || page,
                totalPages: response.pagination?.totalPages || 1,
                totalJobs: response.pagination?.totalJobs || fetchedJobs.length,
                limit: response.pagination?.limit || ITEMS_PER_PAGE
            });
        } catch (error: any) {
            if (error.name === 'AbortError' || error.name === 'CanceledError') {
                return;
            }
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
    }, []);

    // Fetching with debounce and abort
    const prevFiltersRef = useRef({
        searchQuery,
        department: selectedDepartment,
        location: selectedLocation,
        employmentType: selectedEmploymentType,
        experienceLevel: selectedExperienceLevel
    });

    useEffect(() => {
        const abortController = new AbortController();

        const filtersChanged =
            prevFiltersRef.current.searchQuery !== searchQuery ||
            prevFiltersRef.current.department !== selectedDepartment ||
            prevFiltersRef.current.location !== selectedLocation ||
            prevFiltersRef.current.employmentType !== selectedEmploymentType ||
            prevFiltersRef.current.experienceLevel !== selectedExperienceLevel;

        // Reset page ONLY when filters/search change
        if (filtersChanged) {
            prevFiltersRef.current = {
                searchQuery,
                department: selectedDepartment,
                location: selectedLocation,
                employmentType: selectedEmploymentType,
                experienceLevel: selectedExperienceLevel
            };

            if (currentPage !== 1) {
                setCurrentPage(1);
                return;
            }
        }

        const debounceTimer = setTimeout(() => {
            fetchJobs(
                searchQuery,
                currentPage,
                selectedDepartment,
                selectedLocation,
                selectedEmploymentType,
                selectedExperienceLevel,
                abortController.signal
            );
        }, searchQuery ? DEBOUNCE_DELAY : 0);

        return () => {
            clearTimeout(debounceTimer);
            abortController.abort();
        };
    }, [searchQuery, currentPage, selectedDepartment, selectedLocation, selectedEmploymentType, fetchJobs]);

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return searchQuery || selectedDepartment || selectedLocation || selectedEmploymentType || selectedExperienceLevel;
    }, [searchQuery, selectedDepartment, selectedLocation, selectedEmploymentType, selectedExperienceLevel]);

    // Count active filters (excluding search)
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (selectedDepartment) count++;
        if (selectedLocation) count++;
        if (selectedEmploymentType) count++;
        if (selectedExperienceLevel) count++;
        return count;
    }, [selectedDepartment, selectedLocation, selectedEmploymentType, selectedExperienceLevel]);

    // Clear all filters
    const handleClearAll = useCallback(() => {
        setSearchQuery('');
        setSelectedDepartment('');
        setSelectedLocation('');
        setSelectedEmploymentType('');
        setSelectedExperienceLevel('');
        setCurrentPage(1);
    }, []);

    // Clear individual filter
    const handleClearFilter = useCallback((filterType: 'search' | 'department' | 'location' | 'employmentType' | 'experienceLevel') => {
        switch (filterType) {
            case 'search':
                setSearchQuery('');
                break;
            case 'department':
                setSelectedDepartment('');
                break;
            case 'location':
                setSelectedLocation('');
                break;
            case 'employmentType':
                setSelectedEmploymentType('');
                break;
            case 'experienceLevel':
                setSelectedExperienceLevel('');
                break;
        }
    }, []);

    const handlePageChanges = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, []);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }, []);

    const handleDepartmentChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDepartment(e.target.value);
    }, []);

    const handleLocationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedLocation(e.target.value);
    }, []);

    const handleEmploymentTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedEmploymentType(e.target.value);
    }, []);

    const handleExperienceLevelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedExperienceLevel(e.target.value);
    }, []);

    // Active filter tags
    const activeFilters = useMemo(() => {
        const filters: { type: 'search' | 'department' | 'location' | 'employmentType' | 'experienceLevel'; label: string; value: string }[] = [];
        if (searchQuery) filters.push({ type: 'search', label: `"${searchQuery}"`, value: searchQuery });
        if (selectedDepartment) filters.push({ type: 'department', label: selectedDepartment, value: selectedDepartment });
        if (selectedLocation) filters.push({ type: 'location', label: selectedLocation, value: selectedLocation });
        if (selectedEmploymentType) filters.push({ type: 'employmentType', label: selectedEmploymentType, value: selectedEmploymentType });
        // Find label for experience level
        const expLabel = EXPERIENCE_LEVELS.find(e => e.value === selectedExperienceLevel)?.label || selectedExperienceLevel;
        if (selectedExperienceLevel) filters.push({ type: 'experienceLevel', label: expLabel, value: selectedExperienceLevel });
        return filters;
    }, [searchQuery, selectedDepartment, selectedLocation, selectedEmploymentType, selectedExperienceLevel]);

    const resultsText = useMemo(() => {
        if (isLoading) return null;
        return (
            <div className="text-sm text-gray-400">
                Showing {jobs.length} of {pagination.totalJobs} jobs
                {pagination.totalPages > 1 && ` • Page ${currentPage} of ${pagination.totalPages}`}
            </div>
        );
    }, [isLoading, jobs.length, pagination.totalJobs, pagination.totalPages, currentPage]);

    // Empty state content
    const emptyState = useMemo(() => {
        if (isLoading || jobs.length > 0) return null;

        return (
            <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
                <p className="text-gray-400 text-center max-w-md mb-6">
                    {hasActiveFilters
                        ? "No jobs match your current filters. Try adjusting your search criteria or clearing some filters."
                        : "No jobs available at the moment. Check back soon for new opportunities!"}
                </p>
                {hasActiveFilters && (
                    <button
                        onClick={handleClearAll}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                        Clear All Filters
                    </button>
                )}
            </div>
        );
    }, [isLoading, jobs.length, hasActiveFilters, handleClearAll]);

    return (
        <main className="pt-20">
            {/* Search and Filter Section */}
            <div className="bg-surface/30 border-b border-white/5 py-8">
                <div className="max-w-7xl mx-auto px-6 space-y-4">
                    {/* Search and Filters Row */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Enhanced Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search by job title, company, or keywords..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-12 pr-10 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all text-base"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => handleClearFilter('search')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            )}
                        </div>

                        {/* Filter Dropdowns */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <select
                                value={selectedDepartment}
                                onChange={handleDepartmentChange}
                                className="flex-1 lg:flex-none px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 transition-colors appearance-none lg:min-w-[160px] text-base cursor-pointer"
                            >
                                {DEPARTMENTS.map(dept => (
                                    <option key={dept.value} value={dept.value}>{dept.label}</option>
                                ))}
                            </select>
                            <select
                                value={selectedLocation}
                                onChange={handleLocationChange}
                                className="flex-1 lg:flex-none px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 transition-colors appearance-none lg:min-w-[160px] text-base cursor-pointer"
                            >
                                <option value="">All Locations</option>
                                {allLocations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                            <select
                                value={selectedEmploymentType}
                                onChange={handleEmploymentTypeChange}
                                className="flex-1 lg:flex-none px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 transition-colors appearance-none lg:min-w-[140px] text-base cursor-pointer"
                            >
                                {EMPLOYMENT_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            <select
                                value={selectedExperienceLevel}
                                onChange={handleExperienceLevelChange}
                                className="flex-1 lg:flex-none px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 transition-colors appearance-none lg:min-w-[140px] text-base cursor-pointer"
                            >
                                {EXPERIENCE_LEVELS.map(level => (
                                    <option key={level.value} value={level.value}>{level.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active Filters Row */}
                    {activeFilters.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Filter className="w-4 h-4" />
                                Active:
                            </span>
                            {activeFilters.map((filter) => (
                                <span
                                    key={`${filter.type}-${filter.value}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white text-sm rounded-full group hover:bg-white/15 transition-colors"
                                >
                                    {filter.type === 'search' && <Search className="w-3 h-3 text-gray-400" />}
                                    <span className="max-w-[150px] truncate">{filter.label}</span>
                                    <button
                                        onClick={() => handleClearFilter(filter.type)}
                                        className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
                                        aria-label={`Remove ${filter.label} filter`}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            <button
                                onClick={handleClearAll}
                                className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-2"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* Results count & Mobile filter badge */}
                    <div className="flex items-center justify-between">
                        {resultsText}
                        {activeFilterCount > 0 && (
                            <span className="sm:hidden text-sm text-gray-400 flex items-center gap-1">
                                <Filter className="w-4 h-4" />
                                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Job List or Empty State */}
            {emptyState || (
                <JobList
                    jobs={jobs}
                    isLoading={isLoading}
                    showViewAll={false}
                    pagination={{
                        currentPage,
                        totalPages: pagination.totalPages,
                        onPageChange: handlePageChanges
                    }}
                />
            )}
        </main>
    );
};
