import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MapPin, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { jobApi } from '../../services/jobs.api';
import { getCompanyIcon } from '../CompanyLogos';

/* ===================== TYPES ===================== */

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

/* ===================== CONSTANTS ===================== */

const ITEMS_PER_PAGE = 9;

const COMPANY_GRADIENTS: Record<string, string> = {
    google: 'from-blue-500 to-green-500',
    amazon: 'from-orange-500 to-yellow-500',
    microsoft: 'from-blue-600 to-cyan-400',
    meta: 'from-blue-600 to-purple-600',
    apple: 'from-gray-600 to-gray-800',
    netflix: 'from-red-600 to-red-800',
};

/* ===================== UTIL ===================== */

const getCompanyGradient = (name: string) =>
    COMPANY_GRADIENTS[name.toLowerCase()] || 'from-accent to-purple-600';

const generatePaginationButtons = (
    current: number,
    total: number
): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
        return pages;
    }

    pages.push(1);
    if (current > 3) pages.push('...');

    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
    }

    if (current < total - 2) pages.push('...');
    pages.push(total);

    return pages;
};

/* ===================== SUB COMPONENTS ===================== */

const CompanyLogo: React.FC<{ company: CompanyData }> = ({ company }) => {
    const [imgError, setImgError] = useState(false);
    const customIcon = getCompanyIcon(company.name, 64);
    const logoDevKey = import.meta.env.VITE_LOGO_DEV_PUBLIC_KEY;

    if (customIcon) {
        return <div className="w-16 h-16">{customIcon}</div>;
    }

    if (!imgError && logoDevKey) {
        return (
            <img
                src={`https://img.logo.dev/name/${encodeURIComponent(company.name)}?token=${logoDevKey}`}
                onError={() => setImgError(true)}
                className="w-16 h-16 rounded-xl bg-white"
            />
        );
    }

    return (
        <div
            className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getCompanyGradient(
                company.name
            )} flex items-center justify-center text-white font-bold`}
        >
            {company.name[0]}
        </div>
    );
};

const CompanyCard: React.FC<{
    company: CompanyData;
    onViewJobs: (name: string) => void;
}> = ({ company, onViewJobs }) => (
    <Card
        className="p-6 bg-surface/50 hover:bg-surface cursor-pointer"
        onClick={() => onViewJobs(company.name)}
    >
        <div className="flex items-center gap-4 mb-6">
            <CompanyLogo company={company} />
            <div>
                <h3 className="text-xl font-bold">{company.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-3 h-3" />
                    {company.location}
                </div>
            </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <Briefcase className="w-4 h-4" />
                {company.jobCount} open roles
            </div>

            <Button
                variant="outline"
                size="sm"
                aria-label={`View jobs at ${company.name}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onViewJobs(company.name);
                }}
            >
                View Jobs
            </Button>
        </div>
    </Card>
);

/* ===================== HOOKS ===================== */

const useCompanies = () => {
    const [companies, setCompanies] = useState<CompanyData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCompanies = async () => {
            setIsLoading(true);
            try {
                const response = await jobApi.getCompanies();

                const companiesData = response.data?.companies ?? [];

                setCompanies(
                    companiesData
                        .filter((c) => c.name && c.jobs > 0)
                        .map((c) => ({
                            name: c.name,
                            jobCount: c.jobs,
                            location: 'Multiple Locations', // backend does not provide this yet
                        }))
                        .sort((a, b) => b.jobCount - a.jobCount)
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    return { companies, isLoading };
};

const usePagination = (items: CompanyData[]) => {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [items]); // ✅ reset correctly

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return {
        currentPage,
        totalPages,
        currentItems: items.slice(start, start + ITEMS_PER_PAGE),
        onPageChange: setCurrentPage,
    };
};

/* ===================== PAGE ===================== */

export const CompaniesPage: React.FC = () => {
    const navigate = useNavigate();
    const { companies, isLoading } = useCompanies();
    const { currentPage, totalPages, currentItems, onPageChange } =
        usePagination(companies);

    const handleViewJobs = useCallback(
        (company: string) => {
            navigate(`/jobs?company=${encodeURIComponent(company)}`);
        },
        [navigate]
    );

    return (
        <main className="pt-24 px-6 pb-24 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-4">Browse Companies</h1>

                {isLoading ? (
                    <div className="grid grid-cols-3 gap-6">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="h-48 bg-surface/50 animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentItems.map((company) => (
                                <CompanyCard
                                    key={company.name}
                                    company={company}
                                    onViewJobs={handleViewJobs}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center gap-2">
                                {generatePaginationButtons(currentPage, totalPages).map(
                                    (p, i) =>
                                        p === '...' ? (
                                            <span key={i} className="px-3 text-gray-500">
                                                …
                                            </span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => onPageChange(p as number)}
                                                className={`px-4 py-2 rounded-lg ${currentPage === p
                                                    ? 'bg-accent text-white'
                                                    : 'bg-surface text-gray-400'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        )
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
};
