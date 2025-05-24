
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarInset, 
  SidebarTrigger, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from '@/components/ui/sidebar';
import AppLogo from '@/components/AppLogo';
import Link from 'next/link';
import { Home, Compass, PanelLeft, UserCircle, Shirt } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import React from 'react';
import AuthNav from '@/components/AuthNav';
import { getUserFromSession } from '@/actions/userActions';


const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Clother (衣者) - 你的智能时尚助手',
  description: '根据心情和天气智能搭配服装，探索全新穿搭灵感。',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserFromSession();

  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SidebarProvider defaultOpen>
          <Sidebar collapsible="icon">
            <SidebarHeader className="p-4">
              <AppLogo />
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    href="/" 
                    tooltip={{children: "推荐", side: "right", align: "center" }}
                  >
                    <Home />
                    <span>推荐</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    href="/closet" 
                    tooltip={{children: "我的衣橱", side: "right", align: "center" }}
                  >
                     <Shirt /> 
                     <span>衣橱</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    href="/explore" 
                    tooltip={{children: "探索", side: "right", align: "center" }}
                  >
                     <Compass />
                     <span>探索</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 {user && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      href="/profile"
                      tooltip={{ children: "用户中心", side: "right", align: "center" }}
                    >
                      <UserCircle />
                      <span>用户中心</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarContent>
             <div className="mt-auto p-2 border-t border-sidebar-border">
                <AuthNav user={user} />
            </div>
          </Sidebar>
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6 md:hidden">
              <SidebarTrigger>
                <span className="flex items-center justify-center">
                   <PanelLeft className="h-5 w-5" />
                   <span className="sr-only">切换侧边栏</span>
                </span>
              </SidebarTrigger>
              <AppLogo />
              <AuthNav user={user} />
            </header>
            <main className="flex-1 p-4 sm:p-6">
              {children}
              {/* 页脚移到 main 外部，以确保它在所有页面内容下方 */}
            </main>
             <footer className="w-full border-t border-border bg-background p-4 text-center text-xs text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} Clother (衣者). 由 AI 驱动.</p>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                皖ICP备2024050771号
              </a>
            </footer>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
