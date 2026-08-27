/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Memastikan build tidak gagal karena peringatan eslint minor saat deploy
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
