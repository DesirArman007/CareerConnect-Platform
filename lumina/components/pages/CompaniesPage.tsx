import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MapPin, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobs as jobApi } from '../../services/api';
import { getCompanyIcon } from '../CompanyLogos';

interface CompanyData {
    name: string;
    logo?: string;
    location: string;
    jobCount: number;
}

// Gradient map for known companies
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

const ITEMS_PER_PAGE = 9;

export const CompaniesPage: React.FC = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState<CompanyData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCompanies = async () => {
            setIsLoading(true);
            try {
                // Use the new dedicated companies endpoint
                const response = await jobApi.getCompanies();

                // Response: { data: { companies: [{ name, jobs }] } }
                const companiesData = response?.data?.companies || response?.companies || [];

                // Map to our CompanyData format
                const companiesArray: CompanyData[] = companiesData
                    .filter((c: { name: string; jobs: number }) => c.name && c.jobs > 0)
                    .map((c: { name: string; jobs: number }) => ({
                        name: c.name,
                        logo: undefined, // API doesn't return logos
                        location: 'Multiple Locations', // API doesn't return location
                        jobCount: c.jobs
                    }))
                    .sort((a: CompanyData, b: CompanyData) => b.jobCount - a.jobCount);

                setCompanies(companiesArray);
            } catch (error) {
                console.error("Failed to fetch companies", error);
                setCompanies([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    // Pagination calculations
    const totalPages = Math.ceil(companies.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentCompanies = companies.slice(startIndex, endIndex);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Generate pagination buttons (max 7)
    const getPaginationButtons = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push('...');
            if (totalPages > 1) pages.push(totalPages);
        }

        return pages;
    };

    // Get gradient for company
    const getCompanyGradient = (companyName: string): string => {
        const key = companyName.toLowerCase();
        return COMPANY_GRADIENTS[key] || 'from-accent to-purple-600';
    };

    return (
        <main className="pt-24 min-h-screen px-6 pb-24">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">Browse Companies</h1>
                    <p className="text-gray-400 max-w-2xl">
                        Explore companies actively hiring. All job counts are based on actual open positions.
                    </p>
                    {!isLoading && companies.length > 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                            Showing {startIndex + 1}-{Math.min(endIndex, companies.length)} of {companies.length} companies with active job listings
                        </p>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="h-48 rounded-xl bg-surface/50 animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : companies.length === 0 ? (
                    <div className="text-center py-20">
                        <Briefcase className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">No companies with active jobs</h3>
                        <p className="text-gray-500">Check back later for new opportunities.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentCompanies.map((company) => (
                                <Card key={company.name} className="p-6 bg-surface/50 hover:bg-surface border-white/5 transition-colors group">
                                    <div className="flex items-center gap-4 mb-6">
                                        {(() => {
                                            const customIcon = getCompanyIcon(company.name, 64);
                                            if (customIcon) {
                                                return <div className="w-16 h-16 rounded-xl flex items-center justify-center border border-white/10">{customIcon}</div>;
                                            }
                                            if (company.logo) {
                                                return <img src={company.logo} alt={company.name} width={64} height={64} className="w-16 h-16 rounded-xl bg-white/5 object-cover border border-white/10" />;
                                            }
                                            return (
                                                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getCompanyGradient(company.name)} flex items-center justify-center text-white font-bold text-xl border border-white/10`}>
                                                    {company.name?.charAt(0) || 'C'}
                                                </div>
                                            );
                                        })()}
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">{company.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                <MapPin className="w-3 h-3" /> {company.location}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <Briefcase className="w-4 h-4" />
                                            <span>{company.jobCount} {company.jobCount === 1 ? 'open role' : 'open roles'}</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate('/jobs');
                                            }}
                                        >
                                            View Jobs
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-2 sm:gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Previous</span>
                                </Button>

                                <div className="flex items-center gap-1">
                                    {getPaginationButtons().map((page, idx) => (
                                        page === '...' ? (
                                            <span key={`ellipsis-${idx}`} className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center text-gray-500 text-sm">
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page as number)}
                                                className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg flex items-center justify-center transition-colors text-sm sm:text-base ${currentPage === page
                                                    ? 'bg-accent text-white font-bold'
                                                    : 'bg-surface hover:bg-surface/80 text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4"
                                >
                                    <span className="hidden sm:inline">Next</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
};
