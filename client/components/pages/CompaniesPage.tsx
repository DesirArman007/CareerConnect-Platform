import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MapPin, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { jobs as jobApi } from '../../services/api';
import { getCompanyIcon } from '../CompanyLogos';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CompanyData {
    name: string;
    logo?: string;
    location: string;
    jobCount: number;
}

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ITEMS_PER_PAGE = 9;

const COMPANY_GRADIENTS: Record<string, string> = {
    'google': 'from-blue-500 to-green-500',
    'amazon': 'from-orange-500 to-yellow-500',
    'microsoft': 'from-blue-600 to-cyan-400',
    'meta': 'from-blue-600 to-purple-600',
    'apple': 'from-gray-600 to-gray-800',
    'netflix': 'from-red-600 to-red-800',
    'spotify': 'from-green-500 to-green-700',
    'uber': 'from-gray-800 to-black',
    'airbnb': 'from-pink-500 to-red-500',
    'salesforce': 'from-blue-400 to-blue-600',
    'adobe': 'from-red-500 to-red-700',
    'oracle': 'from-red-600 to-orange-600',
    'ibm': 'from-blue-700 to-blue-900',
    'intel': 'from-blue-500 to-cyan-500',
    'nvidia': 'from-green-500 to-lime-500',
    'paypal': 'from-blue-600 to-indigo-600',
    'stripe': 'from-purple-500 to-indigo-600',
    'linkedin': 'from-blue-600 to-blue-800',
    'cisco': 'from-cyan-500 to-blue-600',
    'intuit': 'from-blue-500 to-green-500',
    'jar': 'from-yellow-400 to-yellow-600',
    'zee': 'from-purple-600 to-pink-500',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getCompanyGradient = (companyName: string): string => {
    const key = companyName.toLowerCase();
    return COMPANY_GRADIENTS[key] || 'from-accent to-purple-600';
};

const generatePaginationButtons = (currentPage: number, totalPages: number): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
        return pages;
    }

    pages.push(1);
    if (currentPage > 3) pages.push('...');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const CompanyLogo: React.FC<{ company: CompanyData }> = ({ company }) => {
    const [imgError, setImgError] = useState(false);
    const customIcon = getCompanyIcon(company.name, 64);
    const logoDevKey = import.meta.env.VITE_LOGO_DEV_PUBLIC_KEY;

    if (customIcon) {
        return (
            <div className="w-16 h-16 rounded-xl flex items-center justify-center border border-white/10">
                {customIcon}
            </div>
        );
    }

    // Try Logo.dev first
    if (!imgError && logoDevKey) {
        return (
            <img
                src={`https://img.logo.dev/name/${encodeURIComponent(company.name)}?token=${logoDevKey}`}
                alt={company.name}
                width={64}
                height={64}
                onError={() => setImgError(true)}
                className="w-16 h-16 rounded-xl bg-white/5 object-cover border border-white/10"
            />
        );
    }

    if (company.logo) {
        return (
            <img
                src={company.logo}
                alt={company.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-xl bg-white/5 object-cover border border-white/10"
            />
        );
    }

    return (
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getCompanyGradient(company.name)} flex items-center justify-center text-white font-bold text-xl border border-white/10`}>
            {company.name?.charAt(0) || 'C'}
        </div>
    );
};

const CompanyCard: React.FC<{
    company: CompanyData;
    onViewJobs: (companyName: string) => void;
}> = ({ company, onViewJobs }) => {

    const handleCardClick = useCallback(() => {
        onViewJobs(company.name);
    }, [company.name, onViewJobs]);

    const handleButtonClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onViewJobs(company.name);
    }, [company.name, onViewJobs]);

    return (
        <Card
            className="p-6 bg-surface/50 hover:bg-surface border-white/5 transition-colors group cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="flex items-center gap-4 mb-6">
                <CompanyLogo company={company} />
                <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">
                        {company.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        {company.location}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Briefcase className="w-4 h-4" />
                    <span>
                        {company.jobCount} {company.jobCount === 1 ? 'open role' : 'open roles'}
                    </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleButtonClick}>
                    View Jobs
                </Button>
            </div>
        </Card>
    );
};

const LoadingState: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
            <div
                key={i}
                className="h-48 rounded-xl bg-surface/50 animate-pulse border border-white/5"
            />
        ))}
    </div>
);

const EmptyState: React.FC = () => (
    <div className="text-center py-20">
        <Briefcase className="w-16 h-16 mx-auto text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No companies with active jobs
        </h3>
        <p className="text-gray-500">Check back later for new opportunities.</p>
    </div>
);

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    const paginationButtons = useMemo(
        () => generatePaginationButtons(currentPage, totalPages),
        [currentPage, totalPages]
    );

    if (totalPages <= 1) return null;

    return (
        <div className="mt-12 flex items-center justify-center gap-2 sm:gap-4">
            <Button
                variant="outline"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
            >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex items-center gap-1">
                {paginationButtons.map((page, idx) =>
                    page === '...' ? (
                        <span
                            key={`ellipsis-${idx}`}
                            className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center text-gray-500 text-sm"
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => onPageChange(page as number)}
                            className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg flex items-center justify-center transition-colors text-sm sm:text-base ${currentPage === page
                                ? 'bg-accent text-white font-bold'
                                : 'bg-surface hover:bg-surface/80 text-gray-400 hover:text-white'
                                }`}
                        >
                            {page}
                        </button>
                    )
                )}
            </div>

            <Button
                variant="outline"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useCompanies = () => {
    const [companies, setCompanies] = useState<CompanyData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchCompanies = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await jobApi.getCompanies();
                const companiesData = response?.data?.companies || response?.companies || [];

                const companiesArray: CompanyData[] = companiesData
                    .filter((c: { name: string; jobs: number }) => c.name && c.jobs > 0)
                    .map((c: { name: string; jobs: number }) => ({
                        name: c.name,
                        logo: undefined,
                        location: 'Multiple Locations',
                        jobCount: c.jobs,
                    }))
                    .sort((a: CompanyData, b: CompanyData) => b.jobCount - a.jobCount);

                setCompanies(companiesArray);
            } catch (err) {
                console.error('Failed to fetch companies', err);
                setError(err as Error);
                setCompanies([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    return { companies, isLoading, error };
};

const usePagination = (items: CompanyData[], itemsPerPage: number) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Reset to page 1 when items change
    useEffect(() => {
        setCurrentPage(1);
    }, [items.length]);

    return {
        currentPage,
        totalPages,
        currentItems,
        startIndex,
        endIndex,
        handlePageChange,
    };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CompaniesPage: React.FC = () => {
    const navigate = useNavigate();
    const { companies, isLoading } = useCompanies();
    const {
        currentPage,
        totalPages,
        currentItems: currentCompanies,
        startIndex,
        endIndex,
        handlePageChange,
    } = usePagination(companies, ITEMS_PER_PAGE);

    const handleViewJobs = useCallback(
        (companyName: string) => {
            navigate(`/jobs?company=${encodeURIComponent(companyName)}`);
        },
        [navigate]
    );

    return (
        <main className="pt-6 md:pt-24 min-h-screen px-4 md:px-6 pb-24">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Browse Companies</h1>
                    <p className="text-gray-400 max-w-2xl text-sm md:text-base">
                        Explore companies actively hiring. All job counts are based on actual open
                        positions.
                    </p>
                    {!isLoading && companies.length > 0 && (
                        <p className="text-xs md:text-sm text-gray-500 mt-2">
                            Showing {startIndex + 1}-{Math.min(endIndex, companies.length)} of{' '}
                            {companies.length} companies with active job listings
                        </p>
                    )}
                </div>

                {/* Content Section */}
                {isLoading ? (
                    <LoadingState />
                ) : companies.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentCompanies.map((company) => (
                                <CompanyCard
                                    key={company.name}
                                    company={company}
                                    onViewJobs={handleViewJobs}
                                />
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>
        </main>
    );
};