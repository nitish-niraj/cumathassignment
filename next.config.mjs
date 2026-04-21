/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse uses Node.js built-ins (fs, path, canvas) that can't be
  // bundled for the browser. Marking it as an external keeps it server-only.
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals ?? []), "canvas", "pdf-parse"];
    }
    return config;
  },
};

export default nextConfig;
