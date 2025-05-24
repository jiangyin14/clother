'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ClothingItem } from '@/lib/definitions';
import { X, Trash2, Shirt } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ClothingItemCardProps {
  item: ClothingItem;
  onRemove?: (id: string) => void;
  onAdd?: (item: ClothingItem) => void;
  showAddButton?: boolean;
}

const ClothingItemCard: React.FC<ClothingItemCardProps> = ({ item, onRemove, onAdd, showAddButton = false }) => {
  return (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 h-full">
      <CardHeader className="p-4">
        <CardTitle className="text-md truncate flex items-center gap-2">
          <Shirt size={20} className="text-primary flex-shrink-0" />
          <span className="truncate" title={item.name}>{item.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="aspect-square w-full relative mb-3 rounded-md overflow-hidden bg-muted/30">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
            data-ai-hint={item.isDefault ? item.attributes.slice(0,2).join(" ") : "clothing item"}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">属性：</p>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
            {item.attributes.length > 0 ? (
              item.attributes.map((attr, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {attr}
                </Badge>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">未识别到属性。</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        {showAddButton && onAdd && (
          <Button onClick={() => onAdd(item)} size="sm" className="w-full">
            添加到我的衣橱
          </Button>
        )}
        {!showAddButton && onRemove && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full text-destructive hover:bg-destructive/10 border-destructive/50 hover:text-destructive">
                <Trash2 size={16} className="mr-2" />
                移除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确定要移除这件衣物吗？</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作无法撤销。这将会从你的衣橱中永久删除这件衣物。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={() => onRemove(item.id)} className="bg-destructive hover:bg-destructive/90">
                  确定移除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
};

export default ClothingItemCard;
