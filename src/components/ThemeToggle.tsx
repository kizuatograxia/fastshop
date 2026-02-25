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
        <label className="relative inline-flex items-center cursor-pointer mr-2" aria-label="Toggle Theme">
            <input
                type="checkbox"
                className="sr-only peer"
                checked={isDark}
                onChange={toggleTheme}
            />
            {/* The pill background */}
            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-transform dark:border-gray-600 peer-checked:bg-slate-800 flex items-center justify-between px-1.5 transition-colors duration-300">
                <Sun className="h-4 w-4 text-amber-500 z-10 ml-0.5" />
                <Moon className="h-4 w-4 text-blue-300 z-10 mr-0.5" />
            </div>
        </label>
    );
};

export default ThemeToggle;
