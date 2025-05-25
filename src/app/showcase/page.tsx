
import React from 'react';
import ShowcaseFeed from '@/components/ShowcaseFeed';
import { Separator } from '@/components/ui/separator';
import { GalleryHorizontal } from 'lucide-react';

export default function ShowcasePage() {
  return (
    <div className="container mx-auto font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl flex items-center justify-center">
          <GalleryHorizontal className="inline-block h-8 w-8 md:h-10 md:w-10 mr-3 text-primary" />
          穿搭广场
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
          发现和分享由 Clother (衣者) 用户们生成的精彩穿搭。
        </p>
      </header>

      <Separator className="my-8" />

      <ShowcaseFeed />
    </div>
  );
}
