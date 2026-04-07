/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',              // Static export para GitHub Pages
  trailingSlash: true,           // URLs con / final para compatibilidad
  images: {
    unoptimized: true,           // Requerido para static export
  },
  basePath: process.env.NODE_ENV === 'production' ? '/financial-dashboard' : '',
  // ↑ Ajustar al nombre del repo en GitHub
};

module.exports = nextConfig;
