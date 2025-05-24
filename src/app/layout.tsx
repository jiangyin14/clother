
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
// SheetTitle import is removed from here as it was causing issues when used in the main SidebarHeader for desktop.
// Mobile sheet accessibility will be handled by ensuring the mobile sheet's own header (part of Sidebar component) has an accessible title.
import AppLogo from '@/components/AppLogo';
import Link from 'next/link';
import { Home, Compass, PanelLeft } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button'; // Import buttonVariants
import { cn } from '@/lib/utils'; // Import cn
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
              <AppLogo />
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={{children: "推荐", side: "right", align: "center" }}>
                    <Link href="/" legacyBehavior passHref>
                      <a>
                        {/* Single child for <a>, which is a span that handles flex layout */}
                        <span className="flex items-center gap-2">
                          {/* Single child for the flex span */}
                          <span>
                            <Home />
                            <span>推荐</span>
                          </span>
                        </span>
                      </a>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={{children: "探索", side: "right", align: "center" }}>
                    <Link href="/explore" legacyBehavior passHref>
                      <a>
                        {/* Single child for <a>, which is a span that handles flex layout */}
                        <span className="flex items-center gap-2">
                          {/* Single child for the flex span */}
                          <span>
                             <Compass />
                             <span>探索</span>
                          </span>
                        </span>
                      </a>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6 md:hidden">
              {/*
                When SidebarTrigger uses asChild, its internal Button (from ui/button) also uses asChild.
                This internal Button (now a Slot) receives the child passed here.
                We provide a plain HTML button to simplify what Slot has to process.
              */}
              <SidebarTrigger asChild>
                <button type="button" className={cn(buttonVariants({ variant: "outline", size: "icon" }), "shrink-0")}>
                  {/* Single child for the HTML button, which is a span that handles flex layout */}
                  <span className="flex items-center justify-center">
                    {/* Single child for the flex span */}
                    <span>
                      <PanelLeft className="h-5 w-5" />
                      <span className="sr-only">切换侧边栏</span>
                    </span>
                  </span>
                </button>
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

