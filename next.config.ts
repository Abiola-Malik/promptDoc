/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: "100mb", // Increase body size limit
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb", // For server actions if you use them elsewhere
    },
  },
};

module.exports = nextConfig;
