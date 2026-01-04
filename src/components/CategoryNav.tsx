import React from 'react';
import { Button } from '@/components/ui/button';

interface CategoryNavProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

import { categories } from '@/data/products';

const CategoryNav: React.FC<CategoryNavProps> = ({ activeCategory, onCategoryChange }) => {
    return (
        <div className="sticky top-16 sm:top-20 z-40 bg-background/80 backdrop-blur-md border-b border-border py-4 overflow-x-auto no-scrollbar">
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
