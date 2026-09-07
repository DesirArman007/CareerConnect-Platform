import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { JobList } from '../JobList';
import { SearchControls } from '../search/SearchControls';
import { Job } from '../../types';
import { jobApi } from '../../services/jobs.api';
import { getUniqueLocations } from '../../services/locationService';

/* ========================================================================== */
/* TYPES */
/* ========================================================================== */

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
}

/* ========================================================================== */
/* CONSTANTS */
/* ========================================================================== */

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
];

const EMPLOYMENT_TYPES: FilterOption[] = [
    { value: '', label: 'All Types' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Remote', label: 'Remote' },
];

const EXPERIENCE_LEVELS: FilterOption[] = [
    { value: '', label: 'All Levels' },
    { value: 'entry', label: 'Entry Level (0–2y)' },
    { value: 'mid', label: 'Mid Level (2–5y)' },
    { value: 'senior', label: 'Senior (5y+)' },
    { value: 'director', label: 'Director (8y+)' },
];

/* ========================================================================== */
/* MAIN COMPONENT */
/* ========================================================================== */

export const JobsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [filters, setFilters] = useState<JobFilters>({
        searchQuery: searchParams.get('search') || '',
        department: searchParams.get('department') || '',
        location: searchParams.get('location') || '',
        company: searchParams.get('company') || '',
        employmentType: searchParams.get('type') || '',
        experienceLevel: searchParams.get('experience_level') || '',
    });

    const [currentPage, setCurrentPage] = useState(
        Number(searchParams.get('page')) || 1
    );

    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0,
        limit: ITEMS_PER_PAGE,
    });

    const searchInputRef = useRef<HTMLInputElement>(null);

    /* ====================================================================== */
    /* FETCH JOBS */
    /* ====================================================================== */

    useEffect(() => {
        let timer: NodeJS.Timeout;

        const fetchJobs = async () => {
            setIsLoading(true);

            try {
                let response;

                if (filters.searchQuery.trim()) {
                    response = await jobApi.search({
                        keyword: filters.searchQuery,
                        page: currentPage,
                        limit: ITEMS_PER_PAGE,
                        department: filters.department,
                        location: filters.location,
                        company: filters.company,
                        employment_type: filters.employmentType,
                        experience_level: filters.experienceLevel,
                    });
                } else {
                    response = await jobApi.getAll({
                        page: currentPage,
                        limit: ITEMS_PER_PAGE,
                        department: filters.department,
                        location: filters.location,
                        company: filters.company,
                        employment_type: filters.employmentType,
                        experience_level: filters.experienceLevel,
                    });
                }

                setJobs(response.data.jobs);
                setPagination(response.data.pagination);
            } catch (err) {
                console.error('Failed to fetch jobs', err);
                setJobs([]);
            } finally {
                setIsLoading(false);
            }
        };

        timer = setTimeout(fetchJobs, filters.searchQuery ? DEBOUNCE_DELAY : 0);
        return () => clearTimeout(timer);
    }, [filters, currentPage]);

    /* ====================================================================== */
    /* URL SYNC */
    /* ====================================================================== */

    useEffect(() => {
        const params = new URLSearchParams();

        if (filters.searchQuery) params.set('search', filters.searchQuery);
        if (filters.department) params.set('department', filters.department);
        if (filters.location) params.set('location', filters.location);
        if (filters.company) params.set('company', filters.company);
        if (filters.employmentType) params.set('type', filters.employmentType);
        if (filters.experienceLevel)
            params.set('experience_level', filters.experienceLevel);
        if (currentPage > 1) params.set('page', String(currentPage));

        setSearchParams(params, { replace: true });
    }, [filters, currentPage]);

    /* ====================================================================== */
    /* HANDLERS */
    /* ====================================================================== */

    const updateFilter = useCallback(
        (key: keyof JobFilters, value: string) => {
            setFilters(prev => ({ ...prev, [key]: value }));
            setCurrentPage(1);
        },
        []
    );

    const clearAll = () => {
        setFilters({
            searchQuery: '',
            department: '',
            location: '',
            company: '',
            employmentType: '',
            experienceLevel: '',
        });
        setCurrentPage(1);
    };

    /* ====================================================================== */
    /* ACTIVE FILTERS */
    /* ====================================================================== */

    const activeFilters = useMemo<ActiveFilter[]>(() => {
        const list: ActiveFilter[] = [];

        if (filters.searchQuery)
            list.push({ type: 'search', label: `"${filters.searchQuery}"` });
        if (filters.department)
            list.push({ type: 'department', label: filters.department });
        if (filters.location)
            list.push({ type: 'location', label: filters.location });
        if (filters.company)
            list.push({ type: 'company', label: filters.company });
        if (filters.employmentType)
            list.push({ type: 'employmentType', label: filters.employmentType });
        if (filters.experienceLevel) {
            const label =
                EXPERIENCE_LEVELS.find(e => e.value === filters.experienceLevel)
                    ?.label || filters.experienceLevel;
            list.push({ type: 'experienceLevel', label });
        }

        return list;
    }, [filters]);

    /* ====================================================================== */
    /* RENDER */
    /* ====================================================================== */

    return (
        <main className="min-h-screen bg-[#070709] md:pt-16">
            {/* Top Hero Banner */}
            <div className="relative overflow-hidden bg-[#070709] border-b border-white/5 pt-12 pb-14 sm:pt-16 sm:pb-16">
                {/* Warm ambient orange radial glow on the right side */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[500px] h-[400px] rounded-full bg-[#FF5500]/[0.08] blur-[120px] pointer-events-none" />

                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-[44px] font-bold tracking-tight text-white mb-2.5">
                        Explore <span className="text-[#FF5500]">Opportunities</span>
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base font-normal mb-8 max-w-xl mx-auto">
                        Find your next role. Apply directly. No third-party recruiters.
                    </p>

                    <SearchControls
                        searchQuery={filters.searchQuery}
                        onSearchChange={val => updateFilter('searchQuery', val)}
                        onClearSearch={() => updateFilter('searchQuery', '')}
                        department={filters.department}
                        onDepartmentChange={val => updateFilter('department', val)}
                        departments={DEPARTMENTS}
                        location={filters.location}
                        onLocationChange={val => updateFilter('location', val)}
                        locations={[]}
                        employmentType={filters.employmentType}
                        onTypeChange={val => updateFilter('employmentType', val)}
                        types={EMPLOYMENT_TYPES}
                        experienceLevel={filters.experienceLevel}
                        onExperienceChange={val =>
                            updateFilter('experienceLevel', val)
                        }
                        experienceLevels={EXPERIENCE_LEVELS}
                        onClearAllFilters={clearAll}
                    />
                </div>
            </div>

            <JobList
                jobs={jobs}
                isLoading={isLoading}
                pagination={{
                    currentPage,
                    totalPages: pagination.totalPages,
                    onPageChange: page => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    },
                }}
            />
        </main>
    );
};
