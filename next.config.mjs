/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    config.externals.push("i2c-bus");
    return config;
  },
};

export default nextConfig;
