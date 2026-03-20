/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    compress: true,
    poweredByHeader: false,
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    },
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    // Enable webpack bundle analyzer in development if needed
    webpack: (config, { dev, isServer }) => {
        if (!dev && !isServer) {
            // Production optimizations
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    default: false,
                    vendors: false,
                    commons: {
                        name: 'commons',
                        chunks: 'all',
                        minChunks: 2,
                    },
                },
            };
        }
        return config;
    },
};

module.exports = nextConfig;
