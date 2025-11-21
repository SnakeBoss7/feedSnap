/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
         fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
          boxShadow: {
        right: '5px 0 10px 0px rgba(134, 134, 134, 0.43)', // adjust as needed
      },
      colors: {
        // Brand Colors (Light Mode)
        primary2:'#5BAE83',
        primary1:'#7E2AC9',
        primary5:"#2563EB",
        primary3:"#E94057",
        backgr:'#111828',
        secondary:'#1E2939',
        feed1:'#A855F7',
        feed2:'#5BAE83',
        feed3:'#2563EB',
        feed4:'#fdf25aff',
        feed5:'#b80404ff',

        // Dark Mode Color System
        dark: {
          // Backgrounds
          bg: {
            primary: '#09090b',      // Zinc 950 (Main background)
            secondary: '#18181b',    // Zinc 900 (Card/surface)
            tertiary: '#27272a',     // Zinc 800 (Elevated)
            hover: '#3f3f46',        // Zinc 700 (Hover)
            overlay: '#09090b99',    // Semi-transparent overlay
          },
          // Text Colors
          text: {
            primary: '#fafafa',      // Zinc 50 (Main text)
            secondary: '#a1a1aa',    // Zinc 400 (Secondary text)
            tertiary: '#71717a',     // Zinc 500 (Tertiary text)
            muted: '#52525b',        // Zinc 600 (Muted text)
            disabled: '#3f3f46',     // Zinc 700 (Disabled text)
          },
          // Borders
          border: {
            DEFAULT: '#27272a',      // Zinc 800 (Default border)
            subtle: '#18181b',       // Zinc 900 (Subtle border)
            emphasis: '#3f3f46',     // Zinc 700 (Emphasis border)
          },
          // Brand Colors (Dark Mode Variants)
          primary1: '#9F7AEA',       // Lighter purple for dark mode
          primary2: '#68D391',       // Lighter green for dark mode
          primary3: '#FC8181',       // Lighter red for dark mode
          primary5: '#63B3ED',       // Lighter blue for dark mode
          // Accent Colors
          purple: {
            light: '#D6BCFA',        // purple-300
            DEFAULT: '#A78BFA',      // purple-400
            dark: '#8B5CF6',         // purple-500
          },
          blue: {
            light: '#93C5FD',        // blue-300
            DEFAULT: '#60A5FA',      // blue-400
            dark: '#3B82F6',         // blue-500
          },
          green: {
            light: '#86EFAC',        // green-300
            DEFAULT: '#4ADE80',      // green-400
            dark: '#22C55E',         // green-500
          },
          red: {
            light: '#FCA5A5',        // red-300
            DEFAULT: '#F87171',      // red-400
            dark: '#EF4444',         // red-500
          },
          yellow: {
            light: '#FDE047',        // yellow-300
            DEFAULT: '#FACC15',      // yellow-400
            dark: '#EAB308',         // yellow-500
          },
        },

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
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
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },

  },
  plugins: [require('tailwind-scrollbar-hide')],
}
}