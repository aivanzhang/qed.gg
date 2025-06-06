import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Monochrome Minimalist
        'background-main': '#F7F7F7',
        'ui-element': '#E1E1E1',
        'border-divider': '#CFCFCF',
        'text-secondary': '#B1B1B1',
        'text-primary': '#9E9E9E',

        // Soft Pastel Serenity Accents
        'accent-green': '#D3F8E2',
        'accent-purple': '#E4C1F9',
        'accent-pink': '#F694C1',
        'accent-yellow': '#EDE7B1',
        'accent-blue': '#A9DEF9',

        // Shadcn UI base colors mapping
        background: '#F7F7F7', // Mapped to 'background-main'
        foreground: '#9E9E9E', // Mapped to 'text-primary'
        
        primary: '#9E9E9E', // Mapped to 'text-primary'
        'primary-foreground': '#F7F7F7', // Mapped to 'background-main'
        
        secondary: '#B1B1B1', // Mapped to 'text-secondary'
        'secondary-foreground': '#F7F7F7', // Mapped to 'background-main'
        
        muted: '#E1E1E1', // Mapped to 'ui-element'
        'muted-foreground': '#9E9E9E', // Mapped to 'text-primary'
        
        accent: '#A9DEF9', // Mapped to 'accent-blue' (for Shadcn's 'accent')
        'accent-foreground': '#F7F7F7', // Mapped to 'background-main'
        
        border: '#CFCFCF', // Mapped to 'border-divider'
        input: '#CFCFCF', // Mapped to 'border-divider' (for input borders)
        ring: '#9E9E9E', // Mapped to 'text-primary' (for focus rings)

        // Destructive theme (example, can be adjusted)
        // destructive: '#FF6B6B', // A distinct error color
        // 'destructive-foreground': '#F7F7F7', //
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
