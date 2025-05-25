
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getSharedOutfits } from '@/actions/showcaseActions';
import type { SharedOutfit } from '@/lib/definitions';
import SharedOutfitCard from './SharedOutfitCard';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";

const ITEMS_PER_PAGE = 12;

const ShowcaseFeed: React.FC = () => {
  const [outfits, setOutfits] = useState<SharedOutfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOutfits = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getSharedOutfits({ page, limit: ITEMS_PER_PAGE });
      if (result.error) {
        setError(result.error);
        setOutfits([]);
      } else {
        setOutfits(result.outfits);
        setTotalPages(result.totalPages);
        setCurrentPage(result.currentPage);
      }
    } catch (err) {
      setError('加载穿搭时发生未知错误。');
      setOutfits([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutfits(currentPage);
  }, [fetchOutfits, currentPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading && outfits.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
          <Card key={i} className="rounded-xl shadow-lg">
            <CardHeader className="p-4"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-4 w-2/3 mt-2" /></CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="aspect-[3/4] w-full rounded-lg mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter className="p-4 border-t"><Skeleton className="h-4 w-1/3" /></CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!isLoading && outfits.length === 0) {
    return (
      <div className="text-center py-12">
        <PlusCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">穿搭广场空空如也</h3>
        <p className="text-muted-foreground mb-6">还没有人分享穿搭，快去“推荐”或“探索”页面生成并分享你的第一套穿搭吧！</p>
        <div className="space-x-4">
          <Button asChild variant="default"><Link href="/">前往推荐</Link></Button>
          <Button asChild variant="outline"><Link href="/explore">前往探索</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {outfits.map(outfit => (
          <SharedOutfitCard key={outfit.id} outfit={outfit} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8 py-4">
          <Button
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || isLoading}
            variant="outline"
            size="lg"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            上一页
          </Button>
          <span className="text-sm text-muted-foreground">
            第 {currentPage} 页 / 共 {totalPages} 页
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || isLoading}
            variant="outline"
            size="lg"
          >
            下一页
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ShowcaseFeed;
