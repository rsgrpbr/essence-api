/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
      allowedOrigins: ['www.essenceapp.com.br', 'essenceapp.com.br'],
    },
  },
}

export default nextConfig
