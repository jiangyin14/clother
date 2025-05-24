'use client';

import React from 'react';
import type { ClothingItem } from '@/lib/definitions';
import ClothingItemCard from './ClothingItemCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive } from 'lucide-react';

interface ClosetViewProps {
  myClosetItems: ClothingItem[];
  onRemoveMyClothing: (id: string) => void;
}

const ClosetView: React.FC<ClosetViewProps> = ({
  myClosetItems,
  onRemoveMyClothing,
}) => {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Archive className="text-primary" /> 我的衣橱
          </CardTitle>
          <CardDescription>这是你已上传或添加的物品。它们将用于推荐。</CardDescription>
        </CardHeader>
        <CardContent>
          {myClosetItems.length === 0 ? (
            <p className="text-muted-foreground italic text-center py-8">你的衣橱是空的。上传一些衣物吧！</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myClosetItems.map((item) => (
                <ClothingItemCard key={item.id} item={item} onRemove={onRemoveMyClothing} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClosetView;
