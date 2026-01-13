/** @type {import('next').NextConfig} */
const nextConfig = {
  // 只在生产环境启用静态导出
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
    deviceSizes: [640, 750, 828, 1080],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // 移除 experimental.optimizeCss，貌似在静态导出时有问题 神秘bug
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  compress: true,
}

module.exports = nextConfig