import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
    // Check local storage or system preference on initial load
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved) return saved === 'dark';
            return document.documentElement.classList.contains('dark');
        }
        return true;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className={`
                relative inline-flex h-8 w-14 items-center justify-between rounded-full px-1.5 transition-colors duration-300
                focus:outline-none focus:ring-2 focus:ring-primary/50
                ${isDark ? 'bg-[#334155]' : 'bg-[#E2E8F0]'}
            `}
        >
            <span className="sr-only">Toggle theme</span>

            {/* Icons */}
            <Sun className={`h-4 w-4 z-10 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-100 text-[#F59E0B]'}`} />
            <Moon className={`h-4 w-4 z-10 transition-opacity duration-300 ${isDark ? 'opacity-100 text-[#F8FAFC]' : 'opacity-0'}`} />

            {/* Sliding Circle */}
            <span
                className={`
                    absolute left-[2px] top-[2px] flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-all duration-300
                    ${isDark ? 'translate-x-6 bg-[#0F172A]' : 'translate-x-0 bg-white'}
                `}
            />
        </button>
    );
};

export default ThemeToggle;
