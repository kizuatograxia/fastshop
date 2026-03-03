import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface CategoryNavProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ activeCategory, onCategoryChange }) => {
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        api.getCategories()
            .then(setCategories)
            .catch(err => console.error("Failed to load categories:", err));
    }, []);

    if (categories.length === 0) return null;

    return (
        <div className="hidden md:block sticky top-16 sm:top-20 z-40 bg-background/80 backdrop-blur-md border-b border-border py-4 overflow-x-auto no-scrollbar">
            <div className="container mx-auto px-4 flex gap-2 md:justify-center min-w-max md:min-w-0">
                {categories.map((category) => (
                    <Button
                        key={category.id}
                        variant={activeCategory === category.id ? "default" : "outline"}
                        className="rounded-full whitespace-nowrap"
                        onClick={() => onCategoryChange(category.id)}
                    >
                        <span className="mr-2">{category.emoji}</span>
                        {category.nome}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default CategoryNav;
