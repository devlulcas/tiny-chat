import catpuccin from '@catppuccin/tailwindcss';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  plugins: [
    catpuccin({
      defaultFlavour: 'latte',
      prefix: 'cat',
    }),
  ],
};
