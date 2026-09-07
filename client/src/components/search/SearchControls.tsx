import { Country, State, City } from 'country-state-city';
import React, { useRef, useState, useEffect } from 'react';
import { Search, X, Briefcase, MapPin, Clock, Award, Globe, Navigation } from 'lucide-react';
import { FilterDropdown } from './FilterDropdown';

interface Option {
    value: string;
    label: string;
    closeOnSelect?: boolean;
}

interface SearchControlsProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onClearSearch: () => void;

    // Filters
    department: string;
    onDepartmentChange: (val: string) => void;
    departments: Option[];

    location: string;
    onLocationChange: (val: string) => void;
    locations: Option[]; // Still kept in props but unused in new UI if we fully replace

    employmentType: string;
    onTypeChange: (val: string) => void;
    types: Option[];

    experienceLevel: string;
    onExperienceChange: (val: string) => void;
    experienceLevels: Option[];

    onClearAllFilters: () => void;
}

export const SearchControls: React.FC<SearchControlsProps> = (props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');

    // Reset local state when parent location filter is cleared externally
    useEffect(() => {
        if (!props.location) {
            setSelectedCountry('');
            setSelectedState('');
        }
    }, [props.location]);

    const hasActiveFilters = !!(
        props.department ||
        props.location ||
        props.employmentType ||
        props.experienceLevel
    );

    // Dynamic Location Options Logic
    let locationOptions: Option[] = [];
    let locationLabel = "Location";
    let closeLocationOnSelect = true;

    if (!selectedCountry) {
        locationLabel = "Country";
        closeLocationOnSelect = false; // Stay open to show states
        locationOptions = Country.getAllCountries().map(c => ({
            value: c.isoCode,
            label: c.name
        }));
    } else if (!selectedState) {
        locationLabel = "State / Province";
        closeLocationOnSelect = false; // Stay open to show cities
        locationOptions = [
            { value: '__RESET_COUNTRY__', label: '⬅ Change Country', closeOnSelect: false },
            ...State.getStatesOfCountry(selectedCountry).map(s => ({
                value: s.isoCode,
                label: s.name
            }))
        ];
    } else {
        locationLabel = "City";
        closeLocationOnSelect = true; // Close on city selection (terminal)
        locationOptions = [
            { value: '__RESET_STATE__', label: '⬅ Change State', closeOnSelect: false },
            ...City.getCitiesOfState(selectedCountry, selectedState).map(c => ({
                value: c.name,
                label: c.name
            }))
        ];
    }

    const handleLocationChange = (val: string) => {
        if (!val || val === '__RESET_COUNTRY__') {
            setSelectedCountry('');
            setSelectedState('');
            props.onLocationChange('');
            return;
        }
        if (val === '__RESET_STATE__') {
            setSelectedState('');
            const c = Country.getCountryByCode(selectedCountry);
            if (c) props.onLocationChange(c.name);
            else props.onLocationChange('');
            return;
        }

        if (!selectedCountry) {
            // Selected a Country
            setSelectedCountry(val);
            const c = Country.getCountryByCode(val);
            if (c) props.onLocationChange(c.name);
        } else if (!selectedState) {
            // Selected a State
            setSelectedState(val);
            const s = State.getStateByCodeAndCountry(val, selectedCountry);
            if (s) props.onLocationChange(s.name);
        } else {
            // Selected a City
            props.onLocationChange(val);
        }
    };

    const filterCategories = [
        {
            id: 'location',
            label: locationLabel,
            icon: Globe,
            options: locationOptions,
            value: props.location,
            onChange: handleLocationChange,
            closeOnSelect: closeLocationOnSelect
        },
        {
            id: 'domain',
            label: 'Domain',
            icon: Briefcase,
            options: props.departments,
            value: props.department,
            onChange: props.onDepartmentChange
        },
        {
            id: 'commitment',
            label: 'Commitment',
            icon: Clock,
            options: props.types,
            value: props.employmentType,
            onChange: props.onTypeChange
        },
        {
            id: 'experience',
            label: 'Experience',
            icon: Award,
            options: props.experienceLevels,
            value: props.experienceLevel,
            onChange: props.onExperienceChange
        }
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-3 ">
                {/* Large Search Input */}
                <div className="relative flex-1">
                    <div className="relative h-[50px] flex items-center bg-[#0e0f13] border border-white/10 rounded-xl focus-within:border-white/20 transition-colors overflow-hidden">
                        <div className="pl-4 pr-3 text-gray-400">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            value={props.searchQuery}
                            onChange={(e) => props.onSearchChange(e.target.value)}
                            placeholder="Search by role, skills, company..."
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 h-full text-sm sm:text-base pr-2"
                        />
                        {props.searchQuery && (
                            <button
                                onClick={props.onClearSearch}
                                className="px-4 h-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Trigger */}
                <FilterDropdown
                    categories={filterCategories}
                    onClearAll={props.onClearAllFilters}
                    hasActiveFilters={hasActiveFilters}
                />
            </div>

            {/* Active Filters Chips */}
            {filterCategories.some(c => c.value) && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide pt-1">
                    {filterCategories.filter(c => c.value).map(cat => {
                        const displayLabel = cat.options.find(o => o.value === cat.value)?.label || cat.value;
                        return (
                            <span
                                key={cat.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 text-xs text-gray-200 whitespace-nowrap shadow-sm hover:border-white/20 transition-colors"
                            >
                                <cat.icon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                <span>{displayLabel}</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        cat.onChange('');
                                    }}
                                    className="ml-0.5 p-1 -mr-1 rounded-full text-gray-400 hover:text-white hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center"
                                    aria-label={`Remove ${cat.label} filter`}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        );
                    })}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            props.onClearAllFilters();
                        }}
                        className="text-xs text-gray-400 hover:text-orange-400 underline ml-2 transition-colors cursor-pointer whitespace-nowrap"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
};
