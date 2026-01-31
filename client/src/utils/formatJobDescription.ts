/**
 * Utility to format job descriptions.
 * Converts HTML-like lists to bullets and cleans up whitespace.
 */
import DOMPurify from 'isomorphic-dompurify';

export const formatDescription = (description: string): string => {
    if (!description) return '';

    // 1. Check if it's already HTML (simple check)
    const isHtml = /<[a-z][\s\S]*>/i.test(description);

    let formatted = description;

    if (!isHtml) {
        // If it's plain text, we need to handle newlines and bullets

        // Escape existing HTML to prevent injection if we are treating it as text
        formatted = formatted
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Convert **Header** to styled HTML headers
        // Matches **Text** or Position Overview (if on its own line sometimes)
        formatted = formatted.replace(
            /\*\*(.*?)\*\*/g,
            '<h3 class="text-lg font-semibold text-white mt-6 mb-3 border-l-4 border-primary pl-3">$1</h3>'
        );

        // Convert lists (lines starting with • or -)
        formatted = formatted.replace(
            /(?:^|\n)[ \t]*[•-][ \t]+(.*?)(?=\n|$)/g,
            '<li class="ml-4 list-disc text-gray-300 mb-1">$1</li>'
        );

        // Wrap lists in <ul> (simple heuristic: consecutive <li>)
        // Note: This is a simple regex replacement, might not catch all edge cases but vastly better than plain text

        // Convert remaining newlines to <br> to preserve spacing
        formatted = formatted.replace(/\n/g, '<br />');
    } else {
        // If it is HTML, we might still want to clean it up or style it
        // For now, let's assume raw HTML is better than stripped text
        // But we can add the styling classes to existing <h3> or <strong> tags if we want
        // Let's just return it for now, usually Workday HTML is okay.
    }

    // Sanitize the final output to prevent XSS (Stored XSS protection)
    // This is critical because we use dangerouslySetInnerHTML in the component
    return DOMPurify.sanitize(formatted);
};
