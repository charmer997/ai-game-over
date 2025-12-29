import { NextPage } from 'next'
import Head from 'next/head'

const TestIconsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>图标测试页面</title>
        <meta name="description" content="测试网站图标显示" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">图标测试页面</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">图标文件检查</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img 
                  src="/favicon.ico" 
                  alt="favicon.ico" 
                  className="w-8 h-8 border border-gray-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.border = '2px solid red';
                    target.alt = 'favicon.ico 加载失败';
                  }}
                />
                <span>favicon.ico</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <img 
                  src="/apple-touch-icon-180x180.png" 
                  alt="apple-touch-icon-180x180.png" 
                  className="w-8 h-8 border border-gray-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.border = '2px solid red';
                    target.alt = 'apple-touch-icon-180x180.png 加载失败';
                  }}
                />
                <span>apple-touch-icon-180x180.png</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <img 
                  src="/logo.webp" 
                  alt="logo.webp" 
                  className="w-8 h-8 border border-gray-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.border = '2px solid red';
                    target.alt = 'logo.webp 加载失败';
                  }}
                />
                <span>logo.webp</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">说明</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>如果图标显示正常，说明文件路径正确</li>
              <li>如果图标边框变红，说明文件加载失败</li>
              <li>请检查浏览器控制台是否有404错误</li>
              <li>标签页图标可能需要刷新页面或清除缓存才能看到效果</li>
            </ul>
          </div>
          
          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              返回首页
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default TestIconsPage