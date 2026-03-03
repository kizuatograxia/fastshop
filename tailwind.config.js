import tailwindcssAnimate from "tailwindcss-animate";

export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            colors: {
                border: "hsl(var(--border) / <alpha-value>)",
                input: "hsl(var(--input) / <alpha-value>)",
                ring: "hsl(var(--ring) / <alpha-value>)",
                background: "hsl(var(--background) / <alpha-value>)",
                foreground: "hsl(var(--foreground) / <alpha-value>)",
                primary: {
                    DEFAULT: "hsl(var(--primary) / <alpha-value>)",
                    foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
                    glow: "hsl(var(--primary-glow) / <alpha-value>)",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
                    foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
                    foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
                },
                success: {
                    DEFAULT: "hsl(var(--success) / <alpha-value>)",
                    foreground: "hsl(var(--success-foreground) / <alpha-value>)",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted) / <alpha-value>)",
                    foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent) / <alpha-value>)",
                    foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover) / <alpha-value>)",
                    foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
                },
                card: {
                    DEFAULT: "hsl(var(--card) / <alpha-value>)",
                    foreground: "hsl(var(--card-foreground) / <alpha-value>)",
                },
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background) / <alpha-value>)",
                    foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
                    primary: "hsl(var(--sidebar-primary) / <alpha-value>)",
                    "primary-foreground": "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
                    accent: "hsl(var(--sidebar-accent) / <alpha-value>)",
                    "accent-foreground": "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
                    border: "hsl(var(--sidebar-border) / <alpha-value>)",
                    ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "fade-in": {
                    from: { opacity: "0", transform: "translateY(10px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "slide-in-left": {
                    from: { transform: "translateX(-100%)" },
                    to: { transform: "translateX(0)" },
                },
                "slide-out-left": {
                    from: { transform: "translateX(0)" },
                    to: { transform: "translateX(-100%)" },
                },
                "glow-pulse": {
                    "0%, 100%": { boxShadow: "0 0 20px hsl(162, 95%, 71%, 0.3)" },
                    "50%": { boxShadow: "0 0 40px hsl(162, 95%, 71%, 0.5)" },
                },
                "float": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.5s ease-out forwards",
                "slide-in-left": "slide-in-left 0.3s ease-out",
                "slide-out-left": "slide-out-left 0.3s ease-out",
                "glow-pulse": "glow-pulse 2s ease-in-out infinite",
                "float": "float 3s ease-in-out infinite",
            },
            backgroundImage: {
                'gradient-primary': 'var(--gradient-primary)',
                'gradient-hero': 'var(--gradient-hero)',
                'gradient-card': 'var(--gradient-card)',
            },
        },
    },
    plugins: [tailwindcssAnimate],
};
