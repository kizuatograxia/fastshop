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
        <>
            <style>{`
                .theme-toggle-label {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    cursor: pointer;
                    width: 52px;
                    height: 28px;
                    background-color: #E2E8F0;
                    border-radius: 9999px;
                    transition: background-color 0.3s;
                }
                .dark .theme-toggle-label {
                    background-color: #334155 !important;
                }
                .theme-toggle-slider {
                    position: absolute;
                    left: 2px;
                    top: 2px;
                    width: 24px;
                    height: 24px;
                    background-color: white;
                    border-radius: 50%;
                    transition: transform 0.3s, background-color 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .theme-toggle-checkbox:checked + .theme-toggle-label .theme-toggle-slider {
                    transform: translateX(24px);
                    background-color: #0F172A !important;
                }
                .icon-sun, .icon-moon {
                    font-size: 16px;
                    transition: opacity 0.3s;
                }
                .icon-sun {
                    color: #F59E0B;
                    opacity: 1;
                }
                .icon-moon {
                    color: #F8FAFC;
                    opacity: 0;
                    position: absolute;
                }
                .theme-toggle-checkbox:checked + .theme-toggle-label .icon-sun {
                    opacity: 0;
                }
                .theme-toggle-checkbox:checked + .theme-toggle-label .icon-moon {
                    opacity: 1;
                }
            `}</style>

            <label className="relative inline-flex items-center cursor-pointer mr-2">
                <input
                    type="checkbox"
                    className="sr-only theme-toggle-checkbox"
                    checked={isDark}
                    onChange={toggleTheme}
                />
                <div className="theme-toggle-label flex items-center justify-between px-1.5">
                    <Sun className="icon-sun h-4 w-4 z-10" />
                    <Moon className="icon-moon h-4 w-4 z-10" />
                    <div className="theme-toggle-slider"></div>
                </div>
            </label>
        </>
    );
};

export default ThemeToggle;
