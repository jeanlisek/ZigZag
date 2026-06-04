/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export statique pour déploiement sur hébergement web classique
  // Désactivé en développement pour permettre les routes dynamiques
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  trailingSlash: true,  // Recommandé pour les fichiers statiques
  
  // Skip validation des routes dynamiques pour l'export statique
  skipTrailingSlashRedirect: true,
  
  // Pas de basePath car on sert à la racine de game.zig-zag.fun
  // Les chunks seront servis depuis /_next/static/chunks/...
  basePath: '',
  
  // Assurer que les assets sont générés avec des chemins absolus
  assetPrefix: '',
  
  // Optimisations de performance
  compress: true,
  poweredByHeader: false,
  
  // Headers de sécurité
  // Note: X-Content-Type-Options: nosniff est géré par .htaccess pour les fichiers _next/
  async headers() {
    return [
      {
        // Headers pour les pages HTML uniquement (pas pour les fichiers statiques _next/)
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            // nosniff seulement pour les pages HTML, pas pour les fichiers statiques
            // Les fichiers _next/ sont gérés par .htaccess avec le bon Content-Type
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()'
          }
        ],
      },
    ];
  },

  // Optimisations d'images (unoptimized nécessaire pour export statique)
  images: {
    unoptimized: true,  // Nécessaire pour l'export statique
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Optimisations de compilation (swcMinify est activé par défaut dans Next.js 13+)
  
  // Experimental features pour meilleures performances
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
};

module.exports = nextConfig;



