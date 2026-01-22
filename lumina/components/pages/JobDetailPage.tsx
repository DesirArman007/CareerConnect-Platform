import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Job } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { MapPin, Clock, Building, Briefcase, ArrowLeft, ArrowUpRight, Heart, Globe, Calendar, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobs as jobApi } from '../../services/api';
import { getCompanyIcon } from '../CompanyLogos';

// Helper function to format dates nicely
const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
};

// Helper function to format description with visual hierarchy and highlighting
const formatDescription = (description?: string): string => {
    if (!description) return '<p class="text-gray-400">No description provided.</p>';

    let formatted = description;

    // ========== 1. BOLD SECTION HEADERS ==========
    const sectionHeaders = [
        'About Us', 'About The Company', 'About Company', 'About',
        'What\'s the role\\??', 'The Role', 'Role Overview', 'Position Overview',
        'Our Tech Stack', 'Tech Stack', 'Technology Stack', 'Technologies',
        'What will be your responsibilities\\??', 'Responsibilities', 'Key Responsibilities',
        'What\'s required from you\\??', 'Requirements', 'Required Skills', 'Must Have',
        'Required Qualifications', 'Minimum Qualifications', 'Basic Qualifications',
        'Preferred Qualifications', 'Nice to Have', 'Good to Have', 'Bonus Points',
        'What makes us different\\??', 'Why Join Us\\??', 'Why Us\\??',
        'What employee benefits do we have\\??', 'Benefits', 'Perks', 'What We Offer',
        'What do we stand for\\??', 'Our Values', 'Company Values',
        'Overview', 'Summary', 'Description', 'Job Description',
        'Qualifications', 'Skills', 'Experience', 'Education',
        'Location', 'Work Location', 'Office Location',
        'How to Apply', 'Application Process',
        'Equal Opportunity', 'Diversity', 'Inclusion'
    ];

    sectionHeaders.forEach(header => {
        const regex = new RegExp(`(^|\\n)(${header})(:?)\\s*(\\n|$)`, 'gim');
        formatted = formatted.replace(regex, '$1<h3 class="text-lg font-semibold text-white mt-6 mb-3">$2$3</h3>');
    });

    // ========== DISABLED - was causing mid-word highlighting ==========
    // Numbers with units - DISABLED
    // formatted = formatted.replace(...);

    // Funding amounts - DISABLED
    // formatted = formatted.replace(...);

    // Experience requirements - DISABLED
    // formatted = formatted.replace(...);

    // ========== 3. BOLD TECHNOLOGY NAMES ==========
    const technologies = [
        'React\\.js', 'React', 'ReactJS', 'Next\\.js', 'NextJS', 'Vue\\.js', 'Vue', 'Angular',
        'TypeScript', 'JavaScript', 'Node\\.js', 'NodeJS', 'Express\\.js', 'Express',
        'Python', 'Django', 'Flask', 'FastAPI',
        'Java', 'Spring', 'Spring Boot', 'Kotlin',
        'C\\+\\+', 'C#', '\\.NET', 'ASP\\.NET',
        'Go', 'Golang', 'Rust', 'Ruby', 'Rails', 'Ruby on Rails',
        'PHP', 'Laravel', 'Symfony',
        'Swift', 'Objective-C', 'iOS', 'Android', 'React Native', 'Flutter', 'Dart',
        'TailwindCSS', 'Tailwind', 'CSS', 'SCSS', 'Sass', 'Bootstrap', 'Material UI', 'Chakra UI',
        'HTML5?', 'HTML', 'CSS3',
        'GraphQL', 'REST', 'REST API', 'RESTful', 'gRPC', 'WebSocket',
        'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'DynamoDB',
        'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'K8s',
        'Jenkins', 'CircleCI', 'GitHub Actions', 'GitLab CI', 'Terraform',
        'Git', 'GitHub', 'GitLab', 'Bitbucket',
        'Jira', 'Confluence', 'Slack', 'Figma', 'Sketch',
        'SQL', 'NoSQL', 'ORM', 'Prisma', 'Sequelize',
        'Jest', 'Mocha', 'Cypress', 'Playwright', 'Selenium',
        'Webpack', 'Vite', 'Babel', 'ESLint', 'Prettier',
        'Redux', 'MobX', 'Zustand', 'Recoil',
        'OAuth', 'JWT', 'SSO', 'SAML',
        'Microservices', 'Monolith', 'Serverless', 'Lambda',
        'CI/CD', 'DevOps', 'Agile', 'Scrum', 'Kanban'
    ];

    technologies.forEach(tech => {
        const regex = new RegExp(`\\b(${tech})\\b`, 'gi');
        // Tech names stay normal - no special styling to avoid broken link appearance
    });

    // ========== 4. BOLD COMPANY NAMES (Common ones) ==========
    const companies = [
        'Microsoft', 'Google', 'Amazon', 'Apple', 'Meta', 'Facebook', 'Netflix', 'Uber',
        'LinkedIn', 'Twitter', 'X', 'Airbnb', 'Spotify', 'Salesforce', 'Oracle', 'IBM',
        'Adobe', 'Nvidia', 'Intel', 'AMD', 'Cisco', 'SAP', 'VMware', 'ServiceNow',
        'Stripe', 'PayPal', 'Square', 'Shopify', 'Twilio', 'Zoom', 'Slack', 'Atlassian',
        'Tiger Global', 'Sequoia', 'Andreessen Horowitz', 'a16z', 'Accel', 'Y Combinator',
        'Flipkart', 'Swiggy', 'Zomato', 'Ola', 'Paytm', 'PhonePe', 'Razorpay', 'CRED',
        'Jar', 'Zerodha', 'Groww', 'upGrad', 'Byju\'s', 'Unacademy', 'Meesho', 'Dunzo'
    ];

    // Company names - DISABLED to prevent mid-word bolding
    // companies.forEach(company => {
    //     formatted = formatted.replace(regex, '<strong>...</strong>');
    // });

    // ========== DEGREES - DISABLED to prevent mid-word bolding ==========
    // formatted = formatted.replace(...);


    // ========== 6. FORMAT BULLET LISTS ==========
    // Convert lines starting with -, •, *, or numbers to list items
    const lines = formatted.split('\n');
    let inList = false;
    let listType = 'ul';
    const processedLines: string[] = [];

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        const bulletMatch = trimmedLine.match(/^[-•*]\s+(.+)$/);
        const numberedMatch = trimmedLine.match(/^(\d+)[.)]\s+(.+)$/);

        if (bulletMatch) {
            if (!inList) {
                processedLines.push('<ul class="list-disc list-inside space-y-2 my-4 text-gray-300">');
                inList = true;
                listType = 'ul';
            }
            processedLines.push(`<li class="ml-2">${bulletMatch[1]}</li>`);
        } else if (numberedMatch) {
            if (!inList) {
                processedLines.push('<ol class="list-decimal list-inside space-y-2 my-4 text-gray-300">');
                inList = true;
                listType = 'ol';
            }
            processedLines.push(`<li class="ml-2">${numberedMatch[2]}</li>`);
        } else {
            if (inList) {
                processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
                inList = false;
            }
            processedLines.push(line);
        }
    });

    if (inList) {
        processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
    }

    formatted = processedLines.join('\n');

    // ========== 7. CONVERT NEWLINES TO HTML ==========
    // Double newlines become paragraph breaks
    formatted = formatted
        .split(/\n\n+/)
        .map(para => {
            const trimmed = para.trim();
            // Don't wrap if already has block-level HTML
            if (trimmed.startsWith('<h3') || trimmed.startsWith('<ul') ||
                trimmed.startsWith('<ol') || trimmed.startsWith('<li') ||
                trimmed.startsWith('</ul') || trimmed.startsWith('</ol')) {
                return trimmed;
            }
            return `<p class="text-gray-400 leading-relaxed mb-4">${trimmed.replace(/\n/g, '<br/>')}</p>`;
        })
        .join('');

    return formatted;
};

export const JobDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, toggleSaveJob, isJobSaved } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isSaved = id ? isJobSaved(id) : false;

    const handleToggleSave = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (id) toggleSaveJob(id);
    };

    useEffect(() => {
        const fetchJob = async () => {
            setIsLoading(true);
            setError(null);
            try {
                if (id) {
                    const data = await jobApi.getOne(id);
                    console.log('Fetched job data:', data);
                    if (data && typeof data === 'object') {
                        setJob(data);
                    } else {
                        setError('Job data not found');
                    }
                }
            } catch (err: any) {
                console.error("Failed to fetch job details", err);
                setError(err.message || 'Failed to fetch job details');
            } finally {
                setIsLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    if (isLoading) {
        return (
            <main className="pt-32 min-h-screen px-6 max-w-4xl mx-auto">
                <div className="animate-pulse space-y-8">
                    <div className="h-8 w-32 bg-white/5 rounded"></div>
                    <div className="h-16 w-3/4 bg-white/5 rounded"></div>
                    <div className="h-64 w-full bg-white/5 rounded"></div>
                </div>
            </main>
        );
    }

    if (error || !job) {
        return (
            <main className="pt-32 min-h-screen px-6 flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
                <p className="text-gray-400 mb-8">
                    {error || 'The job posting you are looking for does not exist or has been removed.'}
                </p>
                <Button onClick={() => navigate(-1)}>Back to Jobs</Button>
            </main>
        );
    }

    // Get the apply URL (handle both field names)
    const applyUrl = job.apply_url || job.applyUrl || '#';

    // Get employment type (handle both field names)
    const employmentType = job.employment_type || job.type || 'Not specified';

    // Get posted date
    const postedDate = formatDate(job.createdAt || job.postedAt);

    return (
        <main className="pt-24 min-h-screen px-6 pb-24">
            <div className="max-w-4xl mx-auto">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Jobs</span>
                    </button>

                    <button
                        onClick={handleToggleSave}
                        className={`p-3 rounded-full border transition-all ${isSaved ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-surface border-white/10 text-gray-400 hover:text-white hover:border-white/30'}`}
                        title={isSaved ? "Unsave Job" : "Save Job"}
                    >
                        <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                </div>

                <div className="grid md:grid-cols-[1fr_300px] gap-8 items-start">
                    {/* Main Content */}
                    <div className="space-y-8">
                        {/* Title and Company */}
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{job.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-lg text-gray-400">
                                <span className="flex items-center gap-2">
                                    <Building className="w-5 h-5" /> {job.company}
                                </span>
                                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                                <span className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" /> {job.location}
                                </span>
                            </div>
                        </div>

                        {/* Metadata Badges */}
                        <div className="flex flex-wrap gap-3">
                            {/* Employment Type */}
                            <div className="px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-sm flex items-center gap-2 text-accent">
                                <Briefcase className="w-4 h-4" /> {employmentType}
                            </div>

                            {/* Job Type (job/internship) */}
                            {job.job_type && (
                                <div className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-sm flex items-center gap-2 text-purple-400">
                                    <Tag className="w-4 h-4" /> {job.job_type.charAt(0).toUpperCase() + job.job_type.slice(1)}
                                </div>
                            )}

                            {/* Source */}
                            {job.source && (
                                <div className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-sm flex items-center gap-2 text-blue-400">
                                    <Globe className="w-4 h-4" /> {job.source}
                                </div>
                            )}

                            {/* Department */}
                            {job.department && (
                                <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm flex items-center gap-2 text-gray-300">
                                    {job.department}
                                </div>
                            )}
                        </div>

                        {/* Job Description */}
                        <Card className="p-8 bg-surface/50 border-white/5">
                            <h3 className="text-xl font-bold mb-6">Job Description</h3>
                            <div
                                className="prose prose-invert prose-p:text-gray-400 prose-p:leading-relaxed prose-headings:text-white max-w-none space-y-4"
                                dangerouslySetInnerHTML={{ __html: formatDescription(job.description) }}
                            />
                        </Card>

                        {/* Mobile Apply Button */}
                        <div className="flex flex-col gap-4 md:hidden">
                            <a
                                href={applyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full"
                            >
                                <Button className="w-full flex items-center justify-center gap-2" size="lg">
                                    Apply Now <ArrowUpRight className="w-5 h-5" />
                                </Button>
                            </a>
                        </div>

                        {/* Desktop Bottom Apply Section */}
                        <div className="hidden md:block">
                            <h3 className="text-xl font-bold mb-4">Ready to apply?</h3>
                            <a
                                href={applyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block"
                            >
                                <Button className="flex items-center justify-center gap-2" size="lg">
                                    Apply for this Role <ArrowUpRight className="w-5 h-5" />
                                </Button>
                            </a>
                        </div>
                    </div>

                    {/* Sticky Sidebar */}
                    <div className="md:sticky md:top-32 space-y-6">
                        <Card className="p-6 bg-surface border-white/10 space-y-6">
                            {/* Company Info */}
                            <div className="flex items-center gap-4">
                                {(() => {
                                    const customIcon = getCompanyIcon(job.company, 64);
                                    if (customIcon) {
                                        return <div className="w-16 h-16 rounded-xl flex items-center justify-center">{customIcon}</div>;
                                    }
                                    if (job.logo) {
                                        return <img src={job.logo} alt={job.company} className="w-16 h-16 rounded-xl object-cover bg-white" />;
                                    }
                                    return (
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                            {job.company?.charAt(0) || 'J'}
                                        </div>
                                    );
                                })()}
                                <div>
                                    <h3 className="font-bold text-lg">{job.company}</h3>
                                    <p className="text-sm text-gray-400">{job.location}</p>
                                </div>
                            </div>

                            {/* Job Details */}
                            <div className="border-t border-white/10 pt-6 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Posted
                                    </span>
                                    <span>{postedDate}</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400 flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Type
                                    </span>
                                    <span>{employmentType}</span>
                                </div>

                                {job.source && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400 flex items-center gap-2">
                                            <Globe className="w-4 h-4" /> Source
                                        </span>
                                        <span>{job.source}</span>
                                    </div>
                                )}

                                {job._id && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Job ID</span>
                                        <span className="font-mono text-xs text-gray-500 truncate max-w-[120px]" title={job._id}>
                                            {job._id}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Apply Button */}
                            <a
                                href={applyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full"
                            >
                                <Button className="w-full flex items-center justify-center gap-2">
                                    Apply Now <ArrowUpRight className="w-4 h-4" />
                                </Button>
                            </a>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
};
