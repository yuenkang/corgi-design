/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,jsx,ts,tsx,html}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f4ff',
                    100: '#e0e9ff',
                    200: '#c2d4fe',
                    300: '#94b4fd',
                    400: '#6690fa',
                    500: '#667eea',
                    600: '#4f5bd5',
                    700: '#4149b3',
                    800: '#383f91',
                    900: '#323973',
                },
                secondary: {
                    500: '#764ba2',
                    600: '#5d3a80',
                },
                accent: {
                    500: '#ff6b6b',
                    600: '#ee5a6f',
                }
            },
            animation: {
                'spin-slow': 'spin 1s linear infinite',
                'slide-in': 'slideIn 0.3s ease-out',
                'slide-out': 'slideOut 0.3s ease-in',
            },
            keyframes: {
                slideIn: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                slideOut: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(100%)' },
                }
            }
        },
    },
    plugins: [],
}
