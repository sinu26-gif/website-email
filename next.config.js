/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: require('path').resolve(__dirname, '..'),
};

module.exports = nextConfig;
