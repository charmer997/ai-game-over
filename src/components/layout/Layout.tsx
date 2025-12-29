import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

//浏览器标签页控制
export default function Layout({ children, title = '想让"我爱你"的游戏快点结束"', description = '爱游结同好会' }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: '首页', href: '/' },
    { name: '漫画资源', href: '/chapters' },
    { name: '人物介绍', href: '/characters' },
    { name: '消息情报', href: '/news' },
  ]

  const isActive = (href: string) => router.pathname === href

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* 导航栏 */}
        <nav className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
          <div className="container-responsive">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <img src="/favicon-32x32.png" alt="Logo" className="w-6 h-6" />
                </div>
                <span className="font-bold text-xl text-gray-900">想让"我爱你"的游戏快点结束</span>
              </Link>

              {/* 桌面导航 */}
              <div className="hidden md:flex space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`nav-link ${isActive(item.href) ? 'active' : 'text-gray-700 hover:text-primary-600'}`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* 移动端菜单按钮 */}
              <div className="md:hidden">
                <button
                  type="button"
                  className="text-gray-700 hover:text-primary-600 p-2"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>

            {/* 移动端导航 */}
            {isMenuOpen && (
              <div className="md:hidden border-t border-gray-200 py-4">
                <div className="flex flex-col space-y-3">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`nav-link ${isActive(item.href) ? 'active' : 'text-gray-700 hover:text-primary-600'}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* 主要内容 */}
        <main className="flex-1">
          {children}
        </main>

    
      </div>
    </>
  )
}