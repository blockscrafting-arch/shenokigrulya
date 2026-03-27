import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Продакшен-домен (статика товаров)
      { protocol: "https", hostname: "puppyigrulya.ru", pathname: "/**" },
      // Локальная разработка
      { protocol: "http", hostname: "localhost", pathname: "/**" },
    ],
  },
};

export default nextConfig;
