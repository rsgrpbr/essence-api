import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fixa a raiz do projeto nesta pasta (o repositório tem outro package-lock.json na raiz)
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
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
