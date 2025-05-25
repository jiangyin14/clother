
'use client';

import React from 'react';
import type { ClothingItem } from '@/lib/definitions';
import ClothingItemCard from './ClothingItemCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Archive, Loader2, PlusCircle } from 'lucide-react';

interface ClosetViewProps {
  myClosetItems: ClothingItem[];
  defaultClothingItems: ClothingItem[]; 
  onAddDefaultClothing: (item: ClothingItem) => void;
  onRemoveMyClothing: (id: string) => void;
  isLoading: boolean;
  isLoggedIn: boolean;
}

const ClosetView: React.FC<ClosetViewProps> = ({
  myClosetItems,
  defaultClothingItems,
  onAddDefaultClothing,
  onRemoveMyClothing,
  isLoading,
  isLoggedIn,
}) => {
  const showMyCloset = myClosetItems.length > 0 || isLoading;
  const showDefaultItemsSection = !isLoggedIn && defaultClothingItems.length > 0;

  return (
    <div className="space-y-8">
      {showMyCloset && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Archive className="text-primary" /> 我的衣橱 {isLoggedIn ? "(已同步)" : "(本地)"}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              {isLoggedIn 
                ? "这是您已保存的衣物。它们将用于推荐。" 
                : "这是您本地添加的衣物。登录后可同步到云端。"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && myClosetItems.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm sm:text-base">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                正在加载您的衣橱...
              </div>
            ) : myClosetItems.length === 0 ? (
              <p className="text-muted-foreground italic text-center py-8 text-sm sm:text-base">
                您的衣橱是空的。上传一些衣物，或从下方推荐中添加吧！
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myClosetItems.map((item) => (
                  <ClothingItemCard key={item.id} item={item} onRemove={onRemoveMyClothing} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showDefaultItemsSection && (
         <Card className="shadow-lg border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <PlusCircle className="text-primary" /> 快速添加示例衣物
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              这些是推荐的示例衣物，您可以将它们添加到您的本地衣橱中开始体验。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {defaultClothingItems.map((item) => (
                <ClothingItemCard
                  key={item.id}
                  item={item}
                  onAdd={() => onAddDefaultClothing(item)}
                  showAddButton={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
       {!showMyCloset && !showDefaultItemsSection && !isLoading && (
         <Card className="border-dashed">
            <CardContent className="pt-6 text-center text-muted-foreground text-sm sm:text-base">
                <Archive className="mx-auto h-10 w-10 mb-2" />
                <p>您的衣橱是空的。上传新衣物或登录以查看已保存的衣物。</p>
            </CardContent>
        </Card>
       )}
    </div>
  );
};

export default ClosetView;
