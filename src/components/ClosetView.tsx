'use client';

import React from 'react';
import type { ClothingItem } from '@/lib/definitions';
import ClothingItemCard from './ClothingItemCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Archive } from 'lucide-react';

interface ClosetViewProps {
  myClosetItems: ClothingItem[];
  defaultClothingItems: ClothingItem[];
  onAddDefaultClothing: (item: ClothingItem) => void;
  onRemoveMyClothing: (id: string) => void;
}

const ClosetView: React.FC<ClosetViewProps> = ({
  myClosetItems,
  defaultClothingItems,
  onAddDefaultClothing,
  onRemoveMyClothing,
}) => {
  const availableDefaultItems = defaultClothingItems.filter(
    defaultItem => !myClosetItems.some(closetItem => closetItem.id === defaultItem.id)
  );

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Archive className="text-primary" /> My Closet
          </CardTitle>
          <CardDescription>These are the items you've uploaded or added. They will be used for recommendations.</CardDescription>
        </CardHeader>
        <CardContent>
          {myClosetItems.length === 0 ? (
            <p className="text-muted-foreground italic text-center py-8">Your closet is empty. Upload some clothes or add from default items below!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myClosetItems.map((item) => (
                <ClothingItemCard key={item.id} item={item} onRemove={onRemoveMyClothing} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {availableDefaultItems.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Default Clothing Items</CardTitle>
            <CardDescription>Quickly add these common items to your closet for matching.</CardDescription>
          </CardHeader>
          <CardContent>
             <ScrollArea className="w-full whitespace-nowrap rounded-md">
              <div className="flex w-max space-x-4 p-4">
                {availableDefaultItems.map((item) => (
                  <div key={item.id} className="w-[250px] sm:w-[280px]">
                     <ClothingItemCard item={item} onAdd={onAddDefaultClothing} showAddButton />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClosetView;
