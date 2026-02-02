/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.moltbook.com' },
      { protocol: 'https', hostname: 'images.moltbook.com' },
      { protocol: 'https', hostname: '*.githubusercontent.com' }
    ]
  }
}

module.exports = nextConfig
