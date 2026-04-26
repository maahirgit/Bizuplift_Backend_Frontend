
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: '1rem',
            screens: {
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px',
            },
        },
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
                    light: 'rgb(var(--color-primary-light) / <alpha-value>)',
                    dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
                },
                secondary: {
                    DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
                    light: 'rgb(var(--color-secondary-light) / <alpha-value>)',
                },
                accent: {
                    DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
                },
                surface: {
                    DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
                    alt: '#F3F4F6',
                },
                background: 'rgb(var(--color-background) / <alpha-value>)',
                text: {
                    main: '#1F2937',
                    muted: '#6B7280',
                    light: '#9CA3AF',
                }
            },
            fontFamily: {
                heading: ['var(--font-heading)', 'serif'],
                body: ['var(--font-body)', 'sans-serif'],
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
                'float': 'float 4s ease-in-out infinite',
                'pulse-slow': 'pulseSlow 4s ease-in-out infinite',
                'shimmer': 'shimmer 3s linear infinite',
                'twinkle': 'twinkle 1.5s ease-in-out infinite',
                'mandala': 'mandalaRotate 8s linear infinite',
            },
        },
    },
    plugins: [],
}
