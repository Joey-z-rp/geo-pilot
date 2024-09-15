/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config) => {
    config.externals.push("i2c-bus");
    config.externals.push("serialport");

    return config;
  },
};

export default nextConfig;
