/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Electron
  output: 'standalone',
  
  // Optimize for Electron
  images: {
    unoptimized: false,
  },
  
  // Disable ESLint during build for Electron (temporary)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during build (temporary)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable static page generation for Electron
  generateBuildId: async () => {
    return 'electron-build-' + Date.now();
  },
  
  // Enable experimental features if needed
  experimental: {
    // serverActions: true,
  },
  
  // Webpack configuration for Electron
  webpack: (config, { isServer }) => {
    // Fix for electron
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Suppress warnings about missing _document (App Router doesn't need it)
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
