
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
import { Home, Compass, PanelLeft, UserCircle, Shirt } from 'lucide-react'; // Added Shirt
import { cn } from '@/lib/utils';
import React from 'react';
import AuthNav from '@/components/AuthNav';
import { getUserFromSession } from '@/actions/userActions';
// Removed SheetTitle import as it's not directly used here anymore for the main header

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
              {/* AppLogo is rendered directly. Mobile sheet title is handled by Sidebar component or needs specific prop. */}
              <AppLogo />
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    href="/" 
                    tooltip={{children: "推荐", side: "right", align: "center" }}
                  >
                    <span className="flex items-center gap-2">
                      <Home />
                      <span>推荐</span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    href="/closet" 
                    tooltip={{children: "我的衣橱", side: "right", align: "center" }}
                  >
                     <span className="flex items-center gap-2">
                      <Shirt /> {/* Icon for Closet */}
                      <span>衣橱</span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    href="/explore" 
                    tooltip={{children: "探索", side: "right", align: "center" }}
                  >
                     <span className="flex items-center gap-2">
                      <Compass />
                      <span>探索</span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 {user && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      href="/profile"
                      tooltip={{ children: "用户中心", side: "right", align: "center" }}
                    >
                      <span className="flex items-center gap-2">
                        <UserCircle />
                        <span>用户中心</span>
                      </span>
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
              {/* SidebarTrigger for mobile, no asChild here after component refactor */}
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
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
