/**
 * Utility to parse responsibilities and requirements from job descriptions.
 * Handles both HTML (Greenhouse, Lever, Workday) and markdown / plain text.
 */

const RESPONSIBILITY_KEYWORDS = [
    'responsibilities',
    "what you'll do",
    'what you will do',
    "what you'd do",
    'key responsibilities',
    'core responsibilities',
    'your role',
    'the role',
    'duties',
    'what to expect',
    'about the role',
    'in this role'
];

const REQUIREMENT_KEYWORDS = [
    'requirements',
    "what you'll need",
    'what you will need',
    'what you bring',
    "what you'll bring",
    'qualifications',
    'basic qualifications',
    'minimum qualifications',
    'required skills',
    'who you are',
    'skills and experience',
    'skills & experience',
    'what we look for',
    "what we're looking for",
    'experience required'
];

const ALL_SECTION_KEYWORDS = [...RESPONSIBILITY_KEYWORDS, ...REQUIREMENT_KEYWORDS];

export interface ParsedJobSections {
    responsibilities: string[];
    requirements: string[];
}

export const parseJobSections = (description?: string): ParsedJobSections => {
    if (!description || typeof description !== 'string') {
        return { responsibilities: [], requirements: [] };
    }

    const isHtml = /<[a-z][\s\S]*>/i.test(description);

    if (isHtml && typeof window !== 'undefined' && window.DOMParser) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(description, 'text/html');

            const responsibilities = extractFromDoc(doc, RESPONSIBILITY_KEYWORDS);
            const requirements = extractFromDoc(doc, REQUIREMENT_KEYWORDS);

            return {
                responsibilities: cleanItems(responsibilities),
                requirements: cleanItems(requirements)
            };
        } catch {
            // Fallback to text parser on DOM error
        }
    }

    // Plain text / markdown extraction
    return {
        responsibilities: cleanItems(extractFromText(description, RESPONSIBILITY_KEYWORDS)),
        requirements: cleanItems(extractFromText(description, REQUIREMENT_KEYWORDS))
    };
};

function extractFromDoc(doc: Document, keywords: string[]): string[] {
    const candidates = Array.from(
        doc.querySelectorAll('h1, h2, h3, h4, h5, h6, strong, b, p, div')
    );

    for (const el of candidates) {
        const text = el.textContent?.trim().toLowerCase().replace(/[:*#_]/g, '') || '';
        if (!text) continue;

        // Match if text is close to the keyword
        const matches = keywords.some(k => text === k || text.startsWith(k) || text.includes(k));
        if (matches) {
            // Try to find the following list
            let sibling = el.nextElementSibling;
            if (!sibling && el.parentElement && el.parentElement.tagName !== 'BODY') {
                sibling = el.parentElement.nextElementSibling;
            }

            const items: string[] = [];
            let searchDepth = 0;

            while (sibling && searchDepth < 5) {
                if (sibling.tagName === 'UL' || sibling.tagName === 'OL') {
                    const lis = Array.from(sibling.querySelectorAll('li'))
                        .map(li => li.textContent?.trim() || '')
                        .filter(Boolean);
                    if (lis.length > 0) return lis;
                }

                // If sibling is a paragraph with bullets
                if (sibling.tagName === 'P' || sibling.tagName === 'DIV') {
                    const pText = sibling.textContent?.trim() || '';
                    if (/^[•\-*]\s+/.test(pText)) {
                        items.push(pText.replace(/^[•\-*]\s+/, '').trim());
                    }
                }

                // Stop if next major section heading
                if (/^H[1-4]$/.test(sibling.tagName)) {
                    break;
                }

                sibling = sibling.nextElementSibling;
                searchDepth++;
            }

            if (items.length > 0) return items;
        }
    }

    return [];
}

function extractFromText(text: string, keywords: string[]): string[] {
    const lines = text.split('\n');
    let inSection = false;
    const items: string[] = [];
    const otherSectionKeywords = ALL_SECTION_KEYWORDS.filter(keyword => !keywords.includes(keyword));

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lineLower = line.toLowerCase().replace(/[*#:_]/g, '').trim();

        if (keywords.some(k => lineLower === k || lineLower.startsWith(k))) {
            inSection = true;
            continue;
        }

        if (inSection) {
            // A bare heading for the other section ends the current section.
            if (otherSectionKeywords.some(k => lineLower === k || lineLower.startsWith(`${k} `))) {
                break;
            }

            // Line starts with bullet or number
            if (/^[•\-*]\s+/.test(line)) {
                items.push(line.replace(/^[•\-*]\s+/, '').trim());
            } else if (/^\d+\.\s+/.test(line)) {
                items.push(line.replace(/^\d+\.\s+/, '').trim());
            } else if (items.length > 0 && line.length === 0) {
                // Empty line between items, continue
            } else if (items.length > 0 && (line.endsWith(':') || /^[#*]{1,3}\s+/.test(line))) {
                // Reached next section
                break;
            }
        }
    }

    return items;
}

function cleanItems(items: string[]): string[] {
    return items
        .map(item => item.replace(/\s+/g, ' ').trim())
        .filter(item => item.length > 10 && item.length < 500)
        .slice(0, 15);
}
