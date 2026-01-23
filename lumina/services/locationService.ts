// services/locationService.ts
// Centralized location normalization for consistent filtering

const CITY_ALIASES: Record<string, string> = {
    // Bangalore/Bengaluru variations
    'bangalore': 'Bangalore',
    'bengaluru': 'Bangalore',
    'in-bangalore': 'Bangalore',
    'in-bengaluru': 'Bangalore',

    // Mumbai/Bombay
    'mumbai': 'Mumbai',
    'bombay': 'Mumbai',

    // Delhi variations
    'delhi': 'Delhi',
    'new delhi': 'Delhi',
    'newdelhi': 'Delhi',

    // Gurgaon/Gurugram
    'gurgaon': 'Gurgaon',
    'gurugram': 'Gurgaon',

    // Chennai/Madras
    'chennai': 'Chennai',
    'madras': 'Chennai',

    // Hyderabad
    'hyderabad': 'Hyderabad',

    // Kolkata/Calcutta
    'kolkata': 'Kolkata',
    'calcutta': 'Kolkata',

    // Pune
    'pune': 'Pune',

    // Noida
    'noida': 'Noida',

    // Ahmedabad
    'ahmedabad': 'Ahmedabad',

    // Surat
    'surat': 'Surat',

    // Jaipur
    'jaipur': 'Jaipur',

    // Chandigarh
    'chandigarh': 'Chandigarh',

    // Kochi/Cochin
    'kochi': 'Kochi',
    'cochin': 'Kochi',

    // Remote variations
    'remote': 'Remote',
    'work from home': 'Remote',
    'wfh': 'Remote',
};

/**
 * Normalizes messy location strings to canonical city names
 * 
 * Handles formats like:
 * - "Bengaluru, KA, in" → "Bangalore"
 * - "Mumbai, INDIA, in" → "Mumbai"
 * - "IN-Bengaluru" → "Bangalore"
 * - "Pune, Maharashtra" → "Pune"
 * 
 * @param location - Raw location string from database
 * @returns Normalized city name or empty string
 */
export const normalizeLocation = (location: string): string => {
    if (!location) return '';

    // Step 1: Clean and lowercase
    let cleaned = location
        .toLowerCase()
        .trim()
        // Remove common suffixes
        .replace(/,?\s*(india|in|ind)\s*$/i, '')
        .replace(/,?\s*in$/i, '')
        // Remove state codes (KA, MH, DL, TN, TS, WB, HR, GJ, etc.)
        .replace(/,\s*[a-z]{2}(?:,|$)/i, '')
        // Remove full state names
        .replace(/,\s*(karnataka|maharashtra|delhi|tamil nadu|telangana|west bengal|haryana|gujarat)/i, '')
        .trim()
        // Remove trailing commas
        .replace(/,+$/, '')
        .trim();

    // Step 2: Extract just the city (first part before comma)
    const cityPart = cleaned.split(',')[0].trim();

    // Step 3: Handle "IN-" prefix (e.g., "IN-Bengaluru")
    const withoutPrefix = cityPart.replace(/^in-/, '');

    // Step 4: Check aliases
    if (CITY_ALIASES[withoutPrefix]) {
        return CITY_ALIASES[withoutPrefix];
    }

    // Step 5: Check if original cityPart is in aliases
    if (CITY_ALIASES[cityPart]) {
        return CITY_ALIASES[cityPart];
    }

    // Step 6: Fallback - title case the city part
    return withoutPrefix
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * Get unique normalized locations from job array
 * Used to populate filter dropdowns with clean options
 * 
 * @param jobs - Array of job objects
 * @returns Sorted array of unique normalized location names
 */
export const getUniqueLocations = (jobs: Array<{ location?: string }>): string[] => {
    const locationSet = new Set<string>();

    jobs.forEach(job => {
        if (job.location) {
            const normalized = normalizeLocation(job.location);
            if (normalized) {
                locationSet.add(normalized);
            }
        }
    });

    return Array.from(locationSet).sort();
};

/**
 * Check if a job matches the selected location filter
 * Handles normalization comparison
 * 
 * @param jobLocation - Raw location from job object
 * @param filterLocation - Selected location from dropdown
 * @returns True if job matches the filter
 */
export const matchesLocation = (jobLocation: string, filterLocation: string): boolean => {
    if (!filterLocation) return true; // No filter applied
    return normalizeLocation(jobLocation) === filterLocation;
};

/**
 * Get display name for a location (for UI purposes)
 * Useful for showing normalized names in dropdowns
 * 
 * @param location - Raw location string
 * @returns User-friendly display name
 */
export const getLocationDisplayName = (location: string): string => {
    const normalized = normalizeLocation(location);

    // Add emoji/icon for remote jobs (optional)
    if (normalized === 'Remote') {
        return '🌍 Remote';
    }

    return normalized;
};