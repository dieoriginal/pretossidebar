/** @type {import('next').NextConfig} */
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  // Vercel deployment (no standalone needed)

  // Optimize for Electron
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.myshopify.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },

  // Disable ESLint during build for Electron (temporary)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript errors during build (temporary)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Build ID:
  // - Vercel: usa SHA do commit (determinístico, melhora cache)
  // - Local/Electron: mantém o comportamento anterior (sempre único)
  generateBuildId: async () => {
    if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA;
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

// Sentry configuration
const sentryOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source file uploading during builds
  silent: true,
  org: 'pretos-media-group',
  project: 'javascript-nextjs',

  // Only upload source maps in production
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

export default withSentryConfig(nextConfig, sentryOptions);
