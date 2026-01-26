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
    'virtual': 'Remote',

    // Specific cleanups (messy data -> clean city)
    'bengaluru-vtp': 'Bangalore',
    'palam air force station': 'Delhi',
    'ins rajali': 'Arakkonam',

    // Filter out country-only
    'india': '',
    'ind': '',
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
        .trim();

    // Remove text in parentheses (e.g., "(usa)")
    cleaned = cleaned.replace(/\([^)]*\)/g, '').trim();

    // Remove "In X" prefixes where X is a state code or country
    // Matches: "in ka ", "in tn ", "in "
    cleaned = cleaned.replace(/^in\s+(?:ka|tn|mh|dl|up|wb|rj|gj|ap|ts|kl|hr|pb|or|br|mp)\s+/i, '');
    cleaned = cleaned.replace(/^in\s+/i, '');

    // Remove "Ind -" or "India -" prefixes
    cleaned = cleaned.replace(/^(?:ind|india)\s*-\s*/i, '');

    // Remove "In " followed by anything if it looks like a sentence starter? 
    // Actually the pattern "In Ka Bangalore..." is handled above.
    // "In Indianapolis..." -> "Indianapolis" (handled by ^in\s+)

    // Remove common suffixes
    cleaned = cleaned
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
    let cityPart = cleaned.split(',')[0].trim();

    // Remove "Home Office..." suffix if present in the city part (e.g. "Bangalore Home Office Building 10")
    // Keep the city name at the start
    cityPart = cityPart.replace(/\s+home\s+office.*$/i, '').trim();

    // Remove other noise like "08168 Sam's Club"
    // Heuristic: If it has digits, take the part before digits
    if (/\d/.test(cityPart)) {
        cityPart = cityPart.split(/\s+\d/)[0].trim();
    }

    // Cleaning known noisy suffixes in the string
    cityPart = cityPart
        .replace(/\s+building\s+\d+.*$/i, '')
        .replace(/\s+cumulus.*$/i, '')
        .replace(/\s+ptpp\d+.*$/i, '')
        .replace(/\s+pw\s+li.*$/i, '')
        .replace(/\s+capita\s+land.*$/i, '');


    // Step 3: Handle "IN-" prefix (e.g., "IN-Bengaluru")
    const withoutPrefix = cityPart.replace(/^in-/, '');

    // Step 4: Check aliases
    if (CITY_ALIASES[withoutPrefix] !== undefined) {
        return CITY_ALIASES[withoutPrefix];
    }

    // Step 5: Check if original cityPart is in aliases
    if (CITY_ALIASES[cityPart] !== undefined) {
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