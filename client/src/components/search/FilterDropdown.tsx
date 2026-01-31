import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowLeft, Check, Layers, Search } from 'lucide-react';

/* ===================== TYPES ===================== */

interface FilterOption {
    label: string;
    value: string;
    closeOnSelect?: boolean;
}

interface FilterCategory {
    id: string;
    label: string;
    icon: React.ElementType;
    value?: string;
    options: FilterOption[];
    onChange: (value: string) => void;
    closeOnSelect?: boolean;
}

interface FilterDropdownProps {
    categories: FilterCategory[];
    hasActiveFilters: boolean;
    onClearAll: () => void;
}

/* ===================== ANIMATION ===================== */

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 32 : -32,
        opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
        x: direction > 0 ? -32 : 32,
        opacity: 0,
    }),
};

/* ===================== COMPONENT ===================== */

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
    categories,
    onClearAll,
    hasActiveFilters,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
    const [direction, setDirection] = useState(1);
    const [filterSearch, setFilterSearch] = useState('');

    const buttonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const activeCategory =
        activeCategoryId != null
            ? categories.find(c => c.id === activeCategoryId) ?? null
            : null;

    const isCategoryView = activeCategoryId === null;

    /* ---------- reset search on category change ---------- */
    useEffect(() => {
        setFilterSearch('');
    }, [activeCategoryId]);

    /* ---------- filter options ---------- */
    const filteredOptions =
        activeCategory?.options.filter(opt =>
            opt.label.toLowerCase().includes(filterSearch.toLowerCase())
        ) ?? [];

    /* ---------- outside click (portal safe) ---------- */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;

            if (
                buttonRef.current?.contains(target) ||
                panelRef.current?.contains(target)
            ) {
                return;
            }

            setIsOpen(false);
            setActiveCategoryId(null);
        };

        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* ---------- mobile detection ---------- */
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const update = () => setIsMobile(window.innerWidth < 640);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const rect = buttonRef.current?.getBoundingClientRect();

    /* ===================== RENDER ===================== */

    return (
        <>
            {/* TOGGLE BUTTON */}
            <button
                ref={buttonRef}
                onClick={() => {
                    setIsOpen(v => !v);
                    setActiveCategoryId(null);
                }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${isOpen
                        ? 'bg-white/10 border-white/20 text-white'
                        : 'bg-black/40 border-white/10 text-gray-300 hover:text-white'
                    }`}
            >
                <Layers className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
                <ChevronDown
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {/* DROPDOWN */}
            {isOpen &&
                (isMobile || rect) &&
                createPortal(
                    <>
                        {/* MOBILE BACKDROP */}
                        {isMobile && (
                            <div
                                className="fixed inset-0 bg-black/60 z-50"
                                onClick={() => {
                                    setIsOpen(false);
                                    setActiveCategoryId(null);
                                }}
                            />
                        )}

                        <div
                            ref={panelRef}
                            className="
                fixed z-50 bg-[#1a1a1a] border border-white/10 overflow-hidden
                shadow-[0_-8px_30px_rgba(0,0,0,0.8)]
                sm:rounded-2xl sm:w-[320px]
                inset-x-0 bottom-0 rounded-t-2xl w-full
                sm:inset-auto
              "
                            style={
                                !isMobile
                                    ? {
                                        top: (rect?.bottom ?? 0) + 12,
                                        left: (rect?.right ?? 0) - 320,
                                    }
                                    : undefined
                            }
                        >
                            {/* HEADER */}
                            <div className="flex items-center gap-2 p-4 border-b border-white/5">
                                {!isCategoryView && (
                                    <button
                                        onClick={() => {
                                            setDirection(-1);
                                            setActiveCategoryId(null);
                                        }}
                                        className="p-1 rounded hover:bg-white/5"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                )}

                                <span className="font-semibold text-sm text-white">
                                    {isCategoryView ? 'Filters' : activeCategory?.label}
                                </span>

                                {hasActiveFilters && (
                                    <button
                                        onClick={onClearAll}
                                        className="ml-auto text-xs text-orange-500"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            {/* SEARCH */}
                            {!isCategoryView && (
                                <div className="p-2 border-b border-white/5">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            autoFocus
                                            value={filterSearch}
                                            onChange={e => setFilterSearch(e.target.value)}
                                            placeholder={`Search ${activeCategory?.label}...`}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* BODY */}
                            <div className="relative h-[220px] overflow-hidden">
                                <AnimatePresence initial={false} custom={direction}>
                                    <motion.div
                                        key={isCategoryView ? 'categories' : 'options'}
                                        custom={direction}
                                        variants={slideVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.25, ease: 'easeOut' }}
                                        className="absolute inset-0 overflow-y-auto"
                                    >
                                        {isCategoryView ? (
                                            categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => {
                                                        setDirection(1);
                                                        setActiveCategoryId(cat.id);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                                                >
                                                    <cat.icon className="w-4 h-4" />
                                                    {cat.label}
                                                    {cat.value && (
                                                        <span className="ml-auto w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                                    )}
                                                </button>
                                            ))
                                        ) : filteredOptions.length === 0 ? (
                                            <div className="px-4 py-6 text-sm text-gray-500 text-center">
                                                No matching options
                                            </div>
                                        ) : (
                                            filteredOptions.map(option => {
                                                const selected =
                                                    activeCategory?.value === option.value;

                                                return (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => {
                                                            activeCategory?.onChange(option.value);
                                                            const shouldClose =
                                                                option.closeOnSelect ??
                                                                activeCategory?.closeOnSelect ??
                                                                true;
                                                            if (shouldClose) {
                                                                setIsOpen(false);
                                                                setActiveCategoryId(null);
                                                            }
                                                        }}
                                                        className={`w-full flex items-center justify-between px-4 py-3 text-sm ${selected
                                                                ? 'bg-orange-500/10 text-orange-500'
                                                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                                            }`}
                                                    >
                                                        {option.label}
                                                        {selected && <Check className="w-4 h-4" />}
                                                    </button>
                                                );
                                            })
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </>,
                    document.getElementById('portal-root') ?? document.body
                )}
        </>
    );
};
