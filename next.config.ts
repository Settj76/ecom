/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http', // Or 'https' if your PocketBase server uses SSL
                hostname: '103.174.191.77',
                port: '8080',
                pathname: '/api/files/**',
            },
            {
                // This block allows images from the placeholder service.
                protocol: 'https',
                hostname: 'via.placeholder.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

module.exports = nextConfig;
