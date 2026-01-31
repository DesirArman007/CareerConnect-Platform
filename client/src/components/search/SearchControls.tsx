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
        if (val === '__RESET_COUNTRY__') {
            setSelectedCountry('');
            setSelectedState('');
            props.onLocationChange('');
            return;
        }
        if (val === '__RESET_STATE__') {
            setSelectedState('');
            const c = Country.getCountryByCode(selectedCountry);
            if (c) props.onLocationChange(c.name);
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
                <div className="relative flex-1 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative h-full flex items-center bg-[#0a0a0a] border border-white/10 rounded-xl focus-within:border-white/20 transition-colors overflow-hidden">
                        <div className="pl-4 pr-3 text-gray-500">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            value={props.searchQuery}
                            onChange={(e) => props.onSearchChange(e.target.value)}
                            placeholder="Type to search..."
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 h-full text-base"
                        />
                        {props.searchQuery && (
                            <button
                                onClick={props.onClearSearch}
                                className="px-4 h-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
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

            {/* Mobile Active Filters Summary (Optional visual cue) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {filterCategories.filter(c => c.value).map(cat => (
                    <span key={cat.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-gray-300 whitespace-nowrap">
                        <cat.icon className="w-3 h-3 text-gray-500" />
                        {cat.options.find(o => o.value === cat.value)?.label}
                        <button
                            onClick={() => cat.onChange('')}
                            className="ml-1 hover:text-white"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};
