/* eslint-disable global-require */
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@headlessui/tailwindcss')({ prefix: 'ui' }),
  ],
} satisfies Config;
