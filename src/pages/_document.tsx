import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="zh-CN">
      <Head>
        {/* 性能优化：预连接到外部域名 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* 关键资源预加载 */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* SEO优化 */}
        <meta name="theme-color" content="#3b82f6" />
  
        
        {/* PWA支持（预留） */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* 图标 - 使用正确的文件名和尺寸 */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
        
        {/* 性能监控（可选） */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // 简单的性能监控
                window.addEventListener('load', function() {
                  if ('performance' in window) {
                    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                    console.log('页面加载时间:', loadTime + 'ms');
                  }
                });
              `,
            }}
          />
        )}
      </body>
    </Html>
  )
}