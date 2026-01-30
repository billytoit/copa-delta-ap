/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1e40af',
                    dark: '#1e3a8a',
                    light: '#3b82f6',
                },
                secondary: {
                    DEFAULT: '#eab308',
                    dark: '#ca8a04',
                    light: '#fde047',
                },
                dark: {
                    DEFAULT: '#0f172a',
                    lighter: '#1e293b',
                    lightest: '#334155',
                }
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
