import "../styles/globals.css";
import React from "react";

export const metadata = {
  title: "车险变动成本分析仪表板",
  description: "基于CSV数据的车险变动成本明细分析系统",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold">车险变动成本明细分析系统</h1>
            <div className="text-sm text-slate-500">MVP v0.1.0</div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
