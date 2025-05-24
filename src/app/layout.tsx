
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
// SheetTitle is not directly used here anymore for the main SidebarHeader to avoid context issues.
// Accessibility for the mobile sheet title is handled by ensuring its content has an appropriate heading.
import AppLogo from '@/components/AppLogo';
import Link from 'next/link'; // Keep Link for SidebarMenuButton internal usage
import { Home, Compass, PanelLeft } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button'; // Still needed for SidebarTrigger styling
import { cn } from '@/lib/utils';
import React from 'react';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SidebarProvider defaultOpen>
          <Sidebar collapsible="icon">
            <SidebarHeader className="p-4">
              {/* AppLogo now directly rendered. If mobile sheet needs a specific title,
                  it should be handled by the Sheet component itself or its content. */}
              <AppLogo />
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  {/* SidebarMenuButton now takes href and children directly */}
                  <SidebarMenuButton 
                    href="/" 
                    tooltip={{children: "推荐", side: "right", align: "center" }}
                    // isActive can be determined by path if needed, e.g. using usePathname() hook
                  >
                    <Home />
                    <span>推荐</span>
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
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6 md:hidden">
              {/* SidebarTrigger no longer uses asChild; it renders its own button.
                  Pass variant and size props for styling.
                  Children are the icon and SR text. */}
              <SidebarTrigger variant="outline" size="icon" className="shrink-0">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">切换侧边栏</span>
              </SidebarTrigger>
              <AppLogo />
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

    