import { useState, useEffect, FC } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

import { motion } from 'framer-motion';

interface CategoryNavProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
    excludeCategories?: string[];
}

const CategoryNav: FC<CategoryNavProps> = ({ activeCategory, onCategoryChange, excludeCategories = [] }) => {
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        api.getCategories()
            .then(setCategories)
            .catch(err => console.error("Failed to load categories:", err));
    }, []);

    if (categories.length === 0) return null;

    const visibleCategories = categories.filter(c => !excludeCategories.includes(c.id));

    return (
        <div className="hidden md:block sticky top-16 sm:top-20 z-40 bg-background/80 backdrop-blur-md border-b border-border py-4 overflow-x-auto no-scrollbar">
            <div className="container mx-auto px-4 flex gap-2 md:justify-center min-w-max md:min-w-0">
                {visibleCategories.map((category) => {
                    const isActive = activeCategory === category.id;
                    return (
                        <button
                            key={category.id}
                            onClick={() => onCategoryChange(category.id)}
                            className={`relative px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${isActive ? "text-primary-foreground" : "text-foreground hover:bg-muted"
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeCategoryPill"
                                    className="absolute inset-0 bg-primary rounded-full -z-10"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center">
                                <span className="mr-2">{category.emoji}</span>
                                {category.nome}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryNav;
