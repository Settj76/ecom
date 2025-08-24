/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // This is the crucial change: using the new dedicated PostCSS plugin.
    '@tailwindcss/postcss': {},
    // Autoprefixer is also recommended for better browser compatibility.
    autoprefixer: {},
  },
};

export default config;
