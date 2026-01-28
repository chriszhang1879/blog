import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/navbar";
//这里导入的时候因为queryprovider是default导出 所以导入的时候直接导入名字即可 每个组件只有唯一的一个defualt 导出
import QueryProvider from "../components/providers/QueryProvider";
//但是这里clerkprovider 或者userdataprovider是命名导出没有default 每个组件可以有多个命名导出 所以需要用花括号
import {ClerkProvider} from "../components/providers/ClerkProvider";
import {UserDataProvider} from "../components/providers/UserDataProvider";
import {FavoritesProvider} from "../context/FavoritesContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  fallback: ["system-ui", "sans-serif"],
  display: "swap",
  preload: true
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  fallback: ["monospace"],
  display: "swap",
  preload: true
});

export const metadata: Metadata = {
  title: "Lamalog - Blog & Articles",
  description: "A modern blog platform for sharing ideas and knowledge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        {/* 每个provider要注意细粒度的控制 以防影响到其他组件导致不必要的重新渲染 */}
        <ClerkProvider>
          {/* sessionprovider作用是管理用户会话状态 */}
            {/* queryprovider作用是获取数据并缓存更新 */}
            <QueryProvider>
            {/*用户数据提供者 用于提供用户数据到整个应用中 通过usedatadata的hook钩子工具从数据库查询数据合并用户数据以提供给整个应用使用比如后面useprofile*/}
              <UserDataProvider>
                 <FavoritesProvider>
                   <Navbar />
                   <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                         {children}
                   </main>
                </FavoritesProvider>
             </UserDataProvider>
            </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
