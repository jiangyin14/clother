
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { ClothingItem } from '@/lib/definitions';
import { DEFAULT_CLOTHING_ITEMS } from '@/lib/constants';
import { addClothingItem, getClosetItems, removeClothingItem } from '@/actions/closetActions';
import { useToast } from '@/hooks/use-toast';
import { getUserFromSession } from '@/actions/userActions';

import ClothingUploadForm from '@/components/ClothingUploadForm';
import ClosetView from '@/components/ClosetView';
import { Separator } from '@/components/ui/separator';
import { Loader2, Shirt } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export default function ClosetPage() {
  const [myClosetItems, setMyClosetItems] = useState<ClothingItem[]>([]);
  const [isLoadingCloset, setIsLoadingCloset] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clientLoaded, setClientLoaded] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setClientLoaded(true);
  }, []);

  const fetchClosetItems = useCallback(async () => {
    setIsLoadingCloset(true);
    try {
      const user = await getUserFromSession();
      if (user) {
        setIsLoggedIn(true);
        const items = await getClosetItems();
        setMyClosetItems(items);
      } else {
        setIsLoggedIn(false);
        setMyClosetItems([]); 
      }
    } catch (error) {
      toast({
        title: '加载衣橱失败',
        description: error instanceof Error ? error.message : '无法连接到服务器。',
        variant: 'destructive',
      });
      setIsLoggedIn(false);
      setMyClosetItems([]);
    } finally {
      setIsLoadingCloset(false);
    }
  }, [toast]);

  useEffect(() => {
    if (clientLoaded) {
      fetchClosetItems();
    }
  }, [fetchClosetItems, clientLoaded]);

  const handleClothingAnalyzed = async (newItemData: Omit<ClothingItem, 'id' | 'isDefault' | 'user_id' | 'created_at'>) => {
    const tempId = `uploaded-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newItemForState: ClothingItem = {
      ...newItemData,
      id: tempId,
      isDefault: false,
    };

    if (isLoggedIn) {
      const result = await addClothingItem(newItemForState);
      if ('error' in result) {
        toast({ title: "添加衣物失败", description: result.error, variant: "destructive" });
      } else {
        setMyClosetItems((prevItems) => [result, ...prevItems]);
        toast({ title: "已添加衣物", description: `${result.name} 已保存到您的在线衣橱。` });
      }
    } else {
      setMyClosetItems((prevItems) => [...prevItems, newItemForState]);
      toast({ title: "衣物已分析 (未登录)", description: `${newItemForState.name} 已添加到本地临时列表。登录后才能永久保存。` });
    }
  };

  const handleAddDefaultClothing = (itemToAdd: ClothingItem) => {
    if (!myClosetItems.find(item => item.id === itemToAdd.id)) {
      if (isLoggedIn) {
        const itemToSaveToDb = { ...itemToAdd, id: `user-copy-${itemToAdd.id}-${Date.now()}`, isDefault: false };
        addClothingItem(itemToSaveToDb).then(res => {
          if ('error' in res) {
            toast({ title: "添加示例衣物失败", description: res.error, variant: "destructive" });
          } else {
            setMyClosetItems((prevItems) => [res, ...prevItems]);
            toast({ title: "已添加示例衣物", description: `${res.name} 已添加到你的在线衣橱。` });
          }
        });
      } else {
         setMyClosetItems((prevItems) => [...prevItems, itemToAdd]);
        toast({ title: "已添加示例衣物 (未登录)", description: `${itemToAdd.name} 已添加到本地临时列表。` });
      }
    } else {
      toast({ title: "已存在", description: `${itemToAdd.name} 已在你的衣橱中或临时列表中。`, variant: "default" });
    }
  };

  const handleRemoveMyClothing = async (idToRemove: string) => {
    if (isLoggedIn) {
      const result = await removeClothingItem(idToRemove);
      if (result.success) {
        setMyClosetItems((prevItems) => prevItems.filter((item) => item.id !== idToRemove));
        toast({ title: "已移除物品", description: "该物品已从您的在线衣橱中移除。" });
      } else {
        toast({ title: "移除失败", description: result.error || "无法移除物品。", variant: "destructive" });
      }
    } else {
      setMyClosetItems((prevItems) => prevItems.filter((item) => item.id !== idToRemove));
      toast({ title: "已移除物品", description: "该物品已从本地临时列表中移除。" });
    }
  };
  
  if (!clientLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="container mx-auto font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl flex items-center justify-center">
          <Shirt className="inline-block h-8 w-8 md:h-10 md:w-10 mr-3 text-primary" />
          我的衣橱
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
          在这里管理您的所有衣物。上传新衣物，查看和整理您的个人时尚收藏。
        </p>
      </header>

      <Separator className="my-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8 self-start">
          <ClothingUploadForm onClothingAnalyzed={handleClothingAnalyzed} />
        </div>
        <div className="lg:col-span-2">
          <ClosetView
            myClosetItems={myClosetItems}
            defaultClothingItems={DEFAULT_CLOTHING_ITEMS}
            onAddDefaultClothing={handleAddDefaultClothing}
            onRemoveMyClothing={handleRemoveMyClothing}
            isLoading={isLoadingCloset}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </div>
    </div>
  );
}
