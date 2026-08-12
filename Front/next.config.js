/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // You don't typically need to specify localhost for images,
    // but if you have external images, you can add their domains here.
    domains: ['example.com'], // Add any external domains if needed
  },
};

module.exports = nextConfig;
