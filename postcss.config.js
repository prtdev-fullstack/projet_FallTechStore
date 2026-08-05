export default {
  plugins: {
    // Doit précéder Tailwind : inline les @import avant le traitement des @layer.
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
  },
};
