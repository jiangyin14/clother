
import type { Metadata } from 'next';
// import { Geist, Geist_Mono } from 'next/font/google'; // Comment out or remove this line
import localFont from 'next/font/local'; // Import localFont
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
import { Home, Compass, PanelLeft, Shirt, GalleryHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import AuthNav from '@/components/AuthNav';
import { getUserFromSession } from '@/actions/userActions';
import { buttonVariants } from '@/components/ui/button';
import ClientSideToaster from '@/components/ClientSideToaster';


// Add local font definitions
const geistSans = localFont({
  src: [
    {
      path: '../assets/fonts/Geist-Regular.woff2', // Adjust path if needed
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Geist-Medium.woff2', // Adjust path if needed
      weight: '500',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Geist-SemiBold.woff2', // Adjust path if needed
      weight: '600',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Geist-Bold.woff2', // Adjust path if needed
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-geist-sans',
});

const geistMono = localFont({
  src: [
    {
      path: '../assets/fonts/GeistMono-Regular.woff2', // Adjust path if needed
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/GeistMono-Medium.woff2', // Adjust path if needed
      weight: '500',
      style: 'normal',
    },
    {
      path: '../assets/fonts/GeistMono-SemiBold.woff2', // Adjust path if needed
      weight: '600',
      style: 'normal',
    },
    {
      path: '../assets/fonts/GeistMono-Bold.woff2', // Adjust path if needed
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-geist-mono',
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
            <SidebarHeader className="p-4 border-b border-sidebar-border">
              <AppLogo />
            </SidebarHeader>
            <SidebarContent className="flex flex-col flex-grow p-2">
              <SidebarMenu className="flex flex-col flex-grow h-full gap-2">

                <SidebarMenuItem className="flex flex-grow">
                  <SidebarMenuButton
                    href="/"
                    tooltip={{ children: "推荐", side: "right", align: "center" }}
                    className="h-full w-full flex flex-col items-center justify-center p-3 text-center border rounded-lg shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-lg transition-all duration-150 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:px-0"
                  >
                    <Home size={28} className="mb-1.5 group-data-[collapsible=icon]:mb-0 group-data-[collapsible=icon]:size-6 transition-all" />
                    <span className="font-medium text-base group-data-[collapsible=icon]:hidden">推荐</span>
                    <span className="text-sm text-muted-foreground mt-1 group-data-[collapsible=icon]:hidden px-1 leading-relaxed">
                      获取智能搭配建议，点亮您的每一天。
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem className="flex flex-grow">
                  <SidebarMenuButton
                    href="/closet"
                    tooltip={{ children: "我的衣橱", side: "right", align: "center" }}
                    className="h-full w-full flex flex-col items-center justify-center p-3 text-center border rounded-lg shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-lg transition-all duration-150 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:px-0"
                  >
                     <Shirt size={28} className="mb-1.5 group-data-[collapsible=icon]:mb-0 group-data-[collapsible=icon]:size-6 transition-all" />
                     <span className="font-medium text-base group-data-[collapsible=icon]:hidden">衣橱</span>
                     <span className="text-sm text-muted-foreground mt-1 group-data-[collapsible=icon]:hidden px-1 leading-relaxed">
                      轻松管理您的所有衣物，时尚尽在掌握。
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem className="flex flex-grow">
                  <SidebarMenuButton
                    href="/explore"
                    tooltip={{ children: "探索", side: "right", align: "center" }}
                    className="h-full w-full flex flex-col items-center justify-center p-3 text-center border rounded-lg shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-lg transition-all duration-150 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:px-0"
                  >
                     <Compass size={28} className="mb-1.5 group-data-[collapsible=icon]:mb-0 group-data-[collapsible=icon]:size-6 transition-all" />
                     <span className="font-medium text-base group-data-[collapsible=icon]:hidden">探索</span>
                     <span className="text-sm text-muted-foreground mt-1 group-data-[collapsible=icon]:hidden px-1 leading-relaxed">
                      发现新潮流与风格，激发穿搭无限可能。
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem className="flex flex-grow">
                  <SidebarMenuButton
                    href="/showcase"
                    tooltip={{ children: "穿搭广场", side: "right", align: "center" }}
                    className="h-full w-full flex flex-col items-center justify-center p-3 text-center border rounded-lg shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-lg transition-all duration-150 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:px-0"
                  >
                     <GalleryHorizontal size={28} className="mb-1.5 group-data-[collapsible=icon]:mb-0 group-data-[collapsible=icon]:size-6 transition-all" />
                     <span className="font-medium text-base group-data-[collapsible=icon]:hidden">穿搭广场</span>
                     <span className="text-sm text-muted-foreground mt-1 group-data-[collapsible=icon]:hidden px-1 leading-relaxed">
                      浏览和分享社区成员的时尚穿搭。
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

              </SidebarMenu>
            </SidebarContent>
             <div className="mt-auto p-2 border-t border-sidebar-border">
                <AuthNav user={user} />
            </div>
          </Sidebar>
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6 md:hidden">
              <SidebarTrigger
                variant="ghost"
                size="icon"
                className="shrink-0"
              >
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
             <footer className="w-full border-t border-border bg-background p-4 text-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} Clother (衣者). 由 AI 驱动.</p>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                皖ICP备2024050771号
              </a>
            </footer>
          </SidebarInset>
        </SidebarProvider>
        <ClientSideToaster />
      </body>
    </html>
  );
}
