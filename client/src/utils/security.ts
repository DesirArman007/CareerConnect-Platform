/**
 * Security Utility Functions
 * 
 * Centralized helpers for preventing common frontend vulnerabilities.
 */

/**
 * Validates if a URL is safe for navigation (http/https only).
 * Prevents "javascript:" or "data:" protocol injection attacks.
 * 
 * @param url The URL to validate
 * @returns boolean - true if safe, false if unsafe
 */
export const isSafeUrl = (url: string): boolean => {
    if (!url) return false;

    try {
        // Handle relative URLs if necessary, though external links usually have protocol
        if (url.startsWith('/')) return true;

        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch (e) {
        // If URL parsing fails, fall back to safe regex check
        // Allows relative paths or http/s links
        return /^((https?:\/\/)|(\/))/.test(url);
    }
};

/**
 * Safely opens an external URL in a new tab.
 * Validates the protocol before opening to prevent XSS.
 * 
 * @param url The destination URL
 */
export const openExternalLink = (url: string): void => {
    if (!url) return;

    // Hard check for http/https to prevent protocol injection
    // If it doesn't start with http/https, we won't open it as an external link
    // unless it's a relative path (which window.open treats as same-origin).

    let safeUrl = url.trim();

    // If missing protocol but looks like a domain, prepend https://
    // (Defensive usability improvement, though strict security might reject it)
    if (!/^https?:\/\//i.test(safeUrl) && !safeUrl.startsWith('/') && !safeUrl.startsWith('#')) {
        // Basic check to see if it looks like a domain (e.g. google.com)
        if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(safeUrl) && !safeUrl.includes(':')) {
            safeUrl = `https://${safeUrl}`;
        }
    }

    if (isSafeUrl(safeUrl)) {
        window.open(safeUrl, '_blank', 'noopener,noreferrer');
    } else {
        console.warn('Blocked potentially unsafe URL navigation:', url);
    }
};
