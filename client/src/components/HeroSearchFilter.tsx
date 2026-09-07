import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Laptop, Briefcase, MapPin, Clock, ChevronDown, Check } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

const REMOTE_OPTIONS: FilterOption[] = [
  { label: 'All Work Models', value: '' },
  { label: 'Remote Only', value: 'Remote' },
  { label: 'Hybrid', value: 'Hybrid' },
  { label: 'On-site', value: 'On-site' },
];

const EXPERIENCE_OPTIONS: FilterOption[] = [
  { label: 'All Experience Levels', value: '' },
  { label: 'Entry Level (0–2y)', value: 'entry' },
  { label: 'Mid Level (2–5y)', value: 'mid' },
  { label: 'Senior (5y+)', value: 'senior' },
  { label: 'Director (8y+)', value: 'director' },
];

const LOCATION_OPTIONS: FilterOption[] = [
  { label: 'Worldwide / Any', value: '' },
  { label: 'United States', value: 'United States' },
  { label: 'India', value: 'India' },
  { label: 'United Kingdom', value: 'United Kingdom' },
  { label: 'Canada', value: 'Canada' },
  { label: 'Germany', value: 'Germany' },
  { label: 'Remote', value: 'Remote' },
];

const JOB_TYPE_OPTIONS: FilterOption[] = [
  { label: 'All Job Types', value: '' },
  { label: 'Full-time', value: 'Full-time' },
  { label: 'Internship', value: 'Internship' },
  { label: 'Contract', value: 'Contract' },
  { label: 'Part-time', value: 'Part-time' },
];

export const HeroSearchFilter: React.FC = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [remote, setRemote] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (remote) {
      if (remote === 'Remote') params.set('type', 'Remote');
      else params.set('location', remote);
    }
    if (experience) params.set('experience_level', experience);
    if (location && location !== 'Remote') params.set('location', location);
    if (jobType) params.set('type', jobType);

    const queryString = params.toString();
    navigate(queryString ? `/explore?${queryString}` : '/explore');
  };

  const getButtonLabel = (selectedVal: string, options: FilterOption[], defaultLabel: string) => {
    if (!selectedVal) return defaultLabel;
    const found = options.find((o) => o.value === selectedVal);
    return found ? found.label.split(' (')[0] : defaultLabel;
  };

  return (
    <div ref={containerRef} className="w-full max-w-2xl text-left">
      {/* Search Input Box */}
      <form
        onSubmit={handleSearch}
        className="relative flex items-center bg-[#111111]/90 border border-white/10 hover:border-white/20 focus-within:border-orange-500/80 rounded-2xl p-2 sm:p-2.5 backdrop-blur-xl shadow-2xl transition-all duration-200"
      >
        <div className="pl-3 sm:pl-4 text-gray-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search roles, skills or companies"
          className="w-full bg-transparent text-sm sm:text-base text-white placeholder-gray-500 px-3 sm:px-4 py-2.5 focus:outline-none"
        />

        <button
          type="submit"
          className="flex-shrink-0 bg-gradient-to-r from-[#FF4500] to-[#FF5500] hover:from-[#FF5500] hover:to-[#FF6600] text-white font-semibold text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95 transition-all duration-150 cursor-pointer"
        >
          <span>Search</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Quick Filter Buttons Bar */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 mt-3 sm:mt-4">
        {/* Remote Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'remote' ? null : 'remote')}
            className={`w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-150 ${
              remote
                ? 'bg-orange-500/15 border-orange-500/50 text-orange-300'
                : 'bg-[#141414]/90 hover:bg-white/5 border-white/10 hover:border-white/20 text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Laptop className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{getButtonLabel(remote, REMOTE_OPTIONS, 'Remote')}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openDropdown === 'remote' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'remote' && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-[#161616] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              {REMOTE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setRemote(opt.value);
                    setOpenDropdown(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                    remote === opt.value
                      ? 'bg-orange-500/20 text-orange-400 font-medium'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{opt.label}</span>
                  {remote === opt.value && <Check className="w-3.5 h-3.5 text-orange-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Experience Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'experience' ? null : 'experience')}
            className={`w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-150 ${
              experience
                ? 'bg-orange-500/15 border-orange-500/50 text-orange-300'
                : 'bg-[#141414]/90 hover:bg-white/5 border-white/10 hover:border-white/20 text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Briefcase className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{getButtonLabel(experience, EXPERIENCE_OPTIONS, 'Experience')}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openDropdown === 'experience' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'experience' && (
            <div className="absolute top-full left-0 mt-2 w-52 bg-[#161616] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              {EXPERIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setExperience(opt.value);
                    setOpenDropdown(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                    experience === opt.value
                      ? 'bg-orange-500/20 text-orange-400 font-medium'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{opt.label}</span>
                  {experience === opt.value && <Check className="w-3.5 h-3.5 text-orange-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'location' ? null : 'location')}
            className={`w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-150 ${
              location
                ? 'bg-orange-500/15 border-orange-500/50 text-orange-300'
                : 'bg-[#141414]/90 hover:bg-white/5 border-white/10 hover:border-white/20 text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{getButtonLabel(location, LOCATION_OPTIONS, 'Location')}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openDropdown === 'location' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'location' && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-[#161616] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              {LOCATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setLocation(opt.value);
                    setOpenDropdown(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                    location === opt.value
                      ? 'bg-orange-500/20 text-orange-400 font-medium'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{opt.label}</span>
                  {location === opt.value && <Check className="w-3.5 h-3.5 text-orange-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Job Type Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === 'jobType' ? null : 'jobType')}
            className={`w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-150 ${
              jobType
                ? 'bg-orange-500/15 border-orange-500/50 text-orange-300'
                : 'bg-[#141414]/90 hover:bg-white/5 border-white/10 hover:border-white/20 text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{getButtonLabel(jobType, JOB_TYPE_OPTIONS, 'Job type')}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${openDropdown === 'jobType' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'jobType' && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-[#161616] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              {JOB_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setJobType(opt.value);
                    setOpenDropdown(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                    jobType === opt.value
                      ? 'bg-orange-500/20 text-orange-400 font-medium'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{opt.label}</span>
                  {jobType === opt.value && <Check className="w-3.5 h-3.5 text-orange-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
