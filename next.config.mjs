/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
      },
      {
        protocol: "https",
        hostname: "cdn1.ozone.ru",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s0.rbk.ru",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ebayimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: `${process.env.HOST}:3001`,
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
