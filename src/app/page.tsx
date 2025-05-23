'use client';

import React, { useState, useEffect } from 'react';
import type { ClothingItem } from '@/lib/definitions';
import { DEFAULT_CLOTHING_ITEMS, WEATHER_OPTIONS, MOOD_OPTIONS } from '@/lib/constants';
import { handleGetRecommendationAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

// import AppLogo from '@/components/AppLogo'; // AppLogo is now in layout
import ClothingUploadForm from '@/components/ClothingUploadForm';
import ClosetView from '@/components/ClosetView';
import MoodWeatherInput from '@/components/MoodWeatherInput';
import RecommendationDisplay from '@/components/RecommendationDisplay';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function RecommendationPage() {
  const [myClosetItems, setMyClosetItems] = useState<ClothingItem[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedWeather, setSelectedWeather] = useState<string>(WEATHER_OPTIONS[0]?.value || '');
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isGettingRecommendation, setIsGettingRecommendation] = useState(false);
  const [clientLoaded, setClientLoaded] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setClientLoaded(true);
    // Optionally load some default items into "My Closet" on initial load
    // setMyClosetItems(DEFAULT_CLOTHING_ITEMS.slice(0, 1));
  }, []);


  const handleClothingAnalyzed = (newItemData: Omit<ClothingItem, 'id' | 'isDefault'>) => {
    const newItem: ClothingItem = {
      ...newItemData,
      id: `uploaded-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      isDefault: false,
    };
    setMyClosetItems((prevItems) => [newItem, ...prevItems]);
  };

  const handleAddDefaultClothing = (itemToAdd: ClothingItem) => {
    if (!myClosetItems.find(item => item.id === itemToAdd.id)) {
      setMyClosetItems((prevItems) => [...prevItems, itemToAdd]);
      toast({ title: "已添加物品", description: `${itemToAdd.name} 已添加到你的衣橱。` });
    } else {
      toast({ title: "已存在", description: `${itemToAdd.name} 已在你的衣橱中。`, variant: "default" });
    }
  };

  const handleRemoveMyClothing = (idToRemove: string) => {
    setMyClosetItems((prevItems) => prevItems.filter((item) => item.id !== idToRemove));
    toast({ title: "已移除物品", description: "该物品已从你的衣橱中移除。" });
  };

  const handleGetRecommendation = async () => {
    if (selectedMoods.length === 0) {
      toast({ title: "缺少心情", description: "请选择你当前的心情。", variant: "destructive" });
      return;
    }
    if (!selectedWeather) {
      toast({ title: "缺少天气", description: "请选择当前的天气。", variant: "destructive" });
      return;
    }
    if (myClosetItems.length === 0) {
      toast({ title: "衣橱为空", description: "请先添加一些衣物到你的衣橱。", variant: "destructive" });
      return;
    }

    setIsGettingRecommendation(true);
    setRecommendation(null); 

    const allAttributes = Array.from(new Set(myClosetItems.flatMap(item => item.attributes)));
    const moodKeywordsString = selectedMoods.join(', ');

    try {
      const result = await handleGetRecommendationAction(moodKeywordsString, selectedWeather, allAttributes);
      setRecommendation(result.recommendedOutfit);
      toast({ title: "推荐已准备好！", description: "我们为你找到了一套服装。" });
    } catch (error) {
      toast({
        title: '获取推荐失败',
        description: error instanceof Error ? error.message : '发生未知错误。',
        variant: 'destructive',
      });
      setRecommendation(null);
    } finally {
      setIsGettingRecommendation(false);
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
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">服装推荐</h1>
        <p className="text-muted-foreground mt-1">根据你的衣橱、心情和天气获取个性化搭配建议。</p>
      </header>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ClothingUploadForm onClothingAnalyzed={handleClothingAnalyzed} />
          <ClosetView
            myClosetItems={myClosetItems}
            defaultClothingItems={DEFAULT_CLOTHING_ITEMS}
            onAddDefaultClothing={handleAddDefaultClothing}
            onRemoveMyClothing={handleRemoveMyClothing}
          />
        </div>

        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 self-start">
          <Card>
            <CardHeader>
              <CardTitle>搭配助手</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <MoodWeatherInput
                selectedMoods={selectedMoods}
                onMoodSelectionChange={setSelectedMoods}
                selectedWeather={selectedWeather}
                onWeatherChange={setSelectedWeather}
                weatherOptions={WEATHER_OPTIONS}
                moodOptions={MOOD_OPTIONS}
              />
              
              <Button 
                onClick={handleGetRecommendation} 
                disabled={isGettingRecommendation || myClosetItems.length === 0 || selectedMoods.length === 0 || !selectedWeather}
                className="w-full py-3 text-lg bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
              >
                {isGettingRecommendation ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    正在为你寻找风格...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    获取服装推荐
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          <RecommendationDisplay recommendation={recommendation} isLoading={isGettingRecommendation} />
        </div>
      </div>
      
      <footer className="mt-12 pt-6 border-t text-center text-muted-foreground text-xs">
        <p>&copy; {new Date().getFullYear()} Clother (衣者). 由 AI 驱动。</p>
      </footer>
    </div>
  );
}
