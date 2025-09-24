import type { Metadata } from 'next';
import './globals.css';
import { DashboardProvider } from '@/contexts/DashboardContext';

export const metadata: Metadata = {
  title: '车险多维分析系统',
  description: '车险变动成本明细分析多维数据分析平台',
  keywords: '车险,数据分析,KPI,仪表板,保险',
  authors: [{ name: 'Claude Code' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <DashboardProvider>
          <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center px-4">
                <div className="mr-4 hidden md:flex">
                  <div className="mr-6 flex items-center space-x-2">
                    <div className="h-6 w-6 rounded bg-primary" />
                    <span className="hidden font-bold sm:inline-block">
                      车险多维分析系统
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                  <div className="w-full flex-1 md:w-auto md:flex-none">
                    {/* 这里可以添加搜索或其他功能 */}
                  </div>

                  <nav className="flex items-center space-x-2">
                    <div className="text-sm text-muted-foreground">
                      数据分析平台
                    </div>
                  </nav>
                </div>
              </div>
            </header>

            <main className="flex-1">
              {children}
            </main>

            <footer className="border-t py-6 md:py-0">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                  <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    车险变动成本明细分析系统 © 2024
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>基于 Next.js 构建</span>
                </div>
              </div>
            </footer>
          </div>
        </DashboardProvider>
      </body>
    </html>
  );
}
