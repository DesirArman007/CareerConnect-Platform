import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Filter } from 'lucide-react';
import { JobList } from '../JobList';
import { Job } from '../../types';
import { jobs as jobApi, PaginationInfo } from '../../services/api';
import { getUniqueLocations } from '../../services/locationService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface FilterOption {
    value: string;
    label: string;
}

interface JobFilters {
    searchQuery: string;
    department: string;
    location: string;
    company: string;
    employmentType: string;
    experienceLevel: string;
}

interface ActiveFilter {
    type: keyof Omit<JobFilters, 'searchQuery'> | 'search';
    label: string;
    value: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ITEMS_PER_PAGE = 15;
const DEBOUNCE_DELAY = 300;

const DEPARTMENTS: FilterOption[] = [
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

const EMPLOYMENT_TYPES: FilterOption[] = [
    { value: '', label: 'All Types' },
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Internship', label: 'Internship' },
];

const EXPERIENCE_LEVELS: FilterOption[] = [
    { value: '', label: 'All Levels' },
    { value: 'entry', label: 'Entry Level (0-2y)' },
    { value: 'mid', label: 'Mid Level (2-5y)' },
    { value: 'senior', label: 'Senior (5y+)' },
    { value: 'director', label: 'Director (8y+)' },
];

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useUrlFilters = (): [JobFilters, (filters: Partial<JobFilters>) => void] => {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters: JobFilters = useMemo(() => ({
        searchQuery: searchParams.get('search') || '',
        department: searchParams.get('department') || '',
        location: searchParams.get('location') || '',
        company: searchParams.get('company') || '',
        employmentType: searchParams.get('type') || '',
        experienceLevel: searchParams.get('experience_level') || '',
    }), [searchParams]);

    const updateFilters = useCallback((newFilters: Partial<JobFilters>) => {
        const params = new URLSearchParams();
        const merged = { ...filters, ...newFilters };

        if (merged.searchQuery) params.set('search', merged.searchQuery);
        if (merged.department) params.set('department', merged.department);
        if (merged.location) params.set('location', merged.location);
        if (merged.company) params.set('company', merged.company);
        if (merged.employmentType) params.set('type', merged.employmentType);
        if (merged.experienceLevel) params.set('experience_level', merged.experienceLevel);

        setSearchParams(params, { replace: true });
    }, [filters, setSearchParams]);

    return [filters, updateFilters];
};

const useJobsData = (filters: JobFilters, currentPage: number) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0,
        limit: ITEMS_PER_PAGE,
    });

    const prevFiltersRef = useRef(filters);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const fetchJobs = async () => {
            setIsLoading(true);

            try {
                const trimmedQuery = filters.searchQuery.trim();
                let response;

                if (trimmedQuery) {
                    response = await jobApi.search(
                        trimmedQuery,
                        currentPage,
                        ITEMS_PER_PAGE,
                        filters.department,
                        filters.location,
                        filters.company,
                        filters.employmentType,
                        filters.experienceLevel,
                        abortController.signal
                    );
                } else {
                    response = await jobApi.getAll(
                        currentPage,
                        ITEMS_PER_PAGE,
                        filters.department,
                        filters.location,
                        filters.company,
                        filters.employmentType,
                        filters.experienceLevel,
                        abortController.signal
                    );
                }

                const fetchedJobs = Array.isArray(response.jobs) ? response.jobs : [];
                setJobs(fetchedJobs);
                setPagination({
                    currentPage: response.pagination?.currentPage || currentPage,
                    totalPages: response.pagination?.totalPages || 1,
                    totalJobs: response.pagination?.totalJobs || fetchedJobs.length,
                    limit: response.pagination?.limit || ITEMS_PER_PAGE,
                });
            } catch (error: any) {
                if (error.name === 'AbortError' || error.name === 'CanceledError') {
                    return;
                }
                console.error('Failed to fetch jobs', error);
                setJobs([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalJobs: 0,
                    limit: ITEMS_PER_PAGE,
                });
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce search queries
        const delay = filters.searchQuery ? DEBOUNCE_DELAY : 0;
        const timer = setTimeout(() => {
            fetchJobs();
        }, delay);

        return () => {
            clearTimeout(timer);
            abortController.abort();
        };
    }, [filters, currentPage]);

    // Track filter changes
    useEffect(() => {
        prevFiltersRef.current = filters;
    }, [filters]);

    return { jobs, isLoading, pagination };
};

const useLocations = () => {
    const [locations, setLocations] = useState<string[]>([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const filterJobs = await jobApi.getAllForFilters();
                const normalizedLocations = getUniqueLocations(filterJobs);
                setLocations(normalizedLocations);
            } catch (error) {
                console.error('Failed to fetch locations', error);
            }
        };

        fetchLocations();
    }, []);

    return locations;
};

const useKeyboardShortcuts = (inputRef: React.RefObject<HTMLInputElement>, onClear: () => void) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && document.activeElement === inputRef.current) {
                onClear();
                inputRef.current?.blur();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [inputRef, onClear]);
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const SearchInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    inputRef: React.RefObject<HTMLInputElement>;
}> = ({ value, onChange, onClear, inputRef }) => (
    <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
            ref={inputRef}
            type="text"
            placeholder="Search by job title, company, or keywords..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all text-base"
        />
        {value && (
            <button
                onClick={onClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Clear search"
            >
                <X className="w-4 h-4 text-gray-400" />
            </button>
        )}
    </div>
);

const FilterSelect: React.FC<{
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    className?: string;
}> = ({ value, onChange, options, className = '' }) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`flex-1 lg:flex-none px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 transition-colors appearance-none text-base cursor-pointer ${className}`}
    >
        {options.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </select>
);

const ActiveFilterTag: React.FC<{
    filter: ActiveFilter;
    onRemove: () => void;
}> = ({ filter, onRemove }) => (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white text-sm rounded-full group hover:bg-white/15 transition-colors">
        {filter.type === 'search' && <Search className="w-3 h-3 text-gray-400" />}
        <span className="max-w-[150px] truncate">{filter.label}</span>
        <button
            onClick={onRemove}
            className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
            aria-label={`Remove ${filter.label} filter`}
        >
            <X className="w-3 h-3" />
        </button>
    </span>
);

const EmptyState: React.FC<{
    hasActiveFilters: boolean;
    onClearAll: () => void;
}> = ({ hasActiveFilters, onClearAll }) => (
    <div className="flex flex-col items-center justify-center py-16 px-6">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
        <p className="text-gray-400 text-center max-w-md mb-6">
            {hasActiveFilters
                ? 'No jobs match your current filters. Try adjusting your search criteria or clearing some filters.'
                : 'No jobs available at the moment. Check back soon for new opportunities!'}
        </p>
        {hasActiveFilters && (
            <button
                onClick={onClearAll}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
                Clear All Filters
            </button>
        )}
    </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const JobsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
    
    const [filters, setFilters] = useState<JobFilters>({
        searchQuery: searchParams.get('search') || '',
        department: searchParams.get('department') || '',
        location: searchParams.get('location') || '',
        company: searchParams.get('company') || '',
        employmentType: searchParams.get('type') || '',
        experienceLevel: searchParams.get('experience_level') || '',
    });

    const searchInputRef = useRef<HTMLInputElement>(null);
    const prevFiltersRef = useRef(filters);

    const locations = useLocations();
    const { jobs, isLoading, pagination } = useJobsData(filters, currentPage);

    // Sync filters with URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.searchQuery) params.set('search', filters.searchQuery);
        if (filters.department) params.set('department', filters.department);
        if (filters.location) params.set('location', filters.location);
        if (filters.company) params.set('company', filters.company);
        if (filters.employmentType) params.set('type', filters.employmentType);
        if (filters.experienceLevel) params.set('experience_level', filters.experienceLevel);
        if (currentPage > 1) params.set('page', currentPage.toString());

        setSearchParams(params, { replace: true });
    }, [filters, currentPage, setSearchParams]);

    // Reset page when filters change
    useEffect(() => {
        const filtersChanged =
            prevFiltersRef.current.searchQuery !== filters.searchQuery ||
            prevFiltersRef.current.department !== filters.department ||
            prevFiltersRef.current.location !== filters.location ||
            prevFiltersRef.current.company !== filters.company ||
            prevFiltersRef.current.employmentType !== filters.employmentType ||
            prevFiltersRef.current.experienceLevel !== filters.experienceLevel;

        if (filtersChanged) {
            prevFiltersRef.current = filters;
            if (currentPage !== 1) {
                setCurrentPage(1);
            }
        }
    }, [filters, currentPage]);

    // Handlers
    const updateFilter = useCallback((key: keyof JobFilters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleClearFilter = useCallback((filterType: keyof JobFilters | 'search') => {
        const key = filterType === 'search' ? 'searchQuery' : filterType;
        updateFilter(key as keyof JobFilters, '');
    }, [updateFilter]);

    const handleClearAll = useCallback(() => {
        setFilters({
            searchQuery: '',
            department: '',
            location: '',
            company: '',
            employmentType: '',
            experienceLevel: '',
        });
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useKeyboardShortcuts(searchInputRef, () => updateFilter('searchQuery', ''));

    // Computed values
    const activeFilters = useMemo((): ActiveFilter[] => {
        const result: ActiveFilter[] = [];

        if (filters.searchQuery) {
            result.push({ type: 'search', label: `"${filters.searchQuery}"`, value: filters.searchQuery });
        }
        if (filters.department) {
            result.push({ type: 'department', label: filters.department, value: filters.department });
        }
        if (filters.location) {
            result.push({ type: 'location', label: filters.location, value: filters.location });
        }
        if (filters.company) {
            result.push({ type: 'company', label: filters.company, value: filters.company });
        }
        if (filters.employmentType) {
            result.push({ type: 'employmentType', label: filters.employmentType, value: filters.employmentType });
        }
        if (filters.experienceLevel) {
            const label = EXPERIENCE_LEVELS.find((e) => e.value === filters.experienceLevel)?.label || filters.experienceLevel;
            result.push({ type: 'experienceLevel', label, value: filters.experienceLevel });
        }

        return result;
    }, [filters]);

    const hasActiveFilters = activeFilters.length > 0;
    const activeFilterCount = activeFilters.filter((f) => f.type !== 'search').length;

    const resultsText = useMemo(() => {
        if (isLoading) return null;
        return (
            <div className="text-sm text-gray-400">
                Showing {jobs.length} of {pagination.totalJobs} jobs
                {pagination.totalPages > 1 && ` • Page ${currentPage} of ${pagination.totalPages}`}
            </div>
        );
    }, [isLoading, jobs.length, pagination.totalJobs, pagination.totalPages, currentPage]);

    return (
        <main className="pt-20">
            {/* Search and Filter Section */}
            <div className="bg-surface/30 border-b border-white/5 py-8">
                <div className="max-w-7xl mx-auto px-6 space-y-4">
                    {/* Search and Filters Row */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        <SearchInput
                            value={filters.searchQuery}
                            onChange={(value) => updateFilter('searchQuery', value)}
                            onClear={() => handleClearFilter('search')}
                            inputRef={searchInputRef}
                        />

                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <FilterSelect
                                value={filters.department}
                                onChange={(value) => updateFilter('department', value)}
                                options={DEPARTMENTS}
                                className="lg:min-w-[160px]"
                            />
                            <FilterSelect
                                value={filters.location}
                                onChange={(value) => updateFilter('location', value)}
                                options={[{ value: '', label: 'All Locations' }, ...locations.map((loc) => ({ value: loc, label: loc }))]}
                                className="lg:min-w-[160px]"
                            />
                            <FilterSelect
                                value={filters.employmentType}
                                onChange={(value) => updateFilter('employmentType', value)}
                                options={EMPLOYMENT_TYPES}
                                className="lg:min-w-[140px]"
                            />
                            <FilterSelect
                                value={filters.experienceLevel}
                                onChange={(value) => updateFilter('experienceLevel', value)}
                                options={EXPERIENCE_LEVELS}
                                className="lg:min-w-[140px]"
                            />
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
                                <ActiveFilterTag
                                    key={`${filter.type}-${filter.value}`}
                                    filter={filter}
                                    onRemove={() => handleClearFilter(filter.type)}
                                />
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
            {!isLoading && jobs.length === 0 ? (
                <EmptyState hasActiveFilters={hasActiveFilters} onClearAll={handleClearAll} />
            ) : (
                <JobList
                    jobs={jobs}
                    isLoading={isLoading}
                    showViewAll={false}
                    pagination={{
                        currentPage,
                        totalPages: pagination.totalPages,
                        onPageChange: handlePageChange,
                    }}
                />
            )}
        </main>
    );
};