
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { ClothingItem } from '@/lib/definitions';
import { DEFAULT_CLOTHING_ITEMS, WEATHER_OPTIONS, MOOD_OPTIONS } from '@/lib/constants';
import { handleGetRecommendationAction, handleGenerateOutfitImageAction } from '@/lib/actions';
import { addClothingItem, getClosetItems, removeClothingItem } from '@/actions/closetActions';
import { useToast } from '@/hooks/use-toast';

import ClothingUploadForm from '@/components/ClothingUploadForm';
import ClosetView from '@/components/ClosetView';
import MoodWeatherInput from '@/components/MoodWeatherInput';
import RecommendationDisplay from '@/components/RecommendationDisplay';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { getUserFromSession } from '@/actions/userActions'; 
import { cn } from '@/lib/utils';


export default function RecommendationPage() {
  const [myClosetItems, setMyClosetItems] = useState<ClothingItem[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedWeather, setSelectedWeather] = useState<string>('');
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [outfitImagePromptDetails, setOutfitImagePromptDetails] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGettingRecommendation, setIsGettingRecommendation] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isLoadingCloset, setIsLoadingCloset] = useState(true); 
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  const { toast } = useToast();

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
    fetchClosetItems();
  }, [fetchClosetItems]);


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
        toast({ title: "已添加衣物 (未登录)", description: `${newItemForState.name} 已添加到本地衣橱，登录后可保存。` });
    }
  };
  
  const handleAddDefaultClothing = (itemToAdd: ClothingItem) => {
    if (!myClosetItems.find(item => item.id === itemToAdd.id)) {
      if (isLoggedIn) {
        const itemToSaveToDb = { ...itemToAdd, id: `user-copy-${itemToAdd.id}-${Date.now()}`, isDefault: false };
        addClothingItem(itemToSaveToDb).then(res => {
          if ('error' in res) {
            toast({ title: "添加失败", description: res.error, variant: "destructive" });
          } else {
            setMyClosetItems((prevItems) => [res, ...prevItems]);
            toast({ title: "已添加物品", description: `${res.name} 已添加到你的在线衣橱。` });
          }
        });
      } else {
        setMyClosetItems((prevItems) => [...prevItems, itemToAdd]);
        toast({ title: "已添加物品", description: `${itemToAdd.name} 已添加到你的本地衣橱。` });
      }
    } else {
      toast({ title: "已存在", description: `${itemToAdd.name} 已在你的衣橱中。`, variant: "default" });
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
      toast({ title: "已移除物品", description: "该物品已从本地衣橱中移除。" });
    }
  };

  const handleGetRecommendation = async () => {
    if (selectedMoods.length === 0) {
      toast({ title: "缺少心情", description: "请选择你当前的心情。", variant: "destructive" });
      return;
    }
    if (!selectedWeather) {
      toast({ title: "缺少天气", description: "请选择或自动获取天气信息。", variant: "destructive" });
      return;
    }
    if (myClosetItems.length === 0 && !isLoggedIn) { 
      toast({ title: "衣橱为空", description: "请先添加一些衣物到你的本地衣橱。", variant: "destructive" });
      return;
    }
    if (myClosetItems.length === 0 && isLoggedIn && !isLoadingCloset) { 
      toast({ title: "在线衣橱为空", description: "请先添加一些衣物到您的在线衣橱。", variant: "destructive" });
      return;
    }

    setIsGettingRecommendation(true);
    setRecommendation(null); 
    setOutfitImagePromptDetails(null);
    setGeneratedImageUrl(null);

    const allAttributes = Array.from(new Set(myClosetItems.flatMap(item => item.attributes)));
    const moodKeywordsString = selectedMoods.join(', ');

    try {
      const result = await handleGetRecommendationAction(moodKeywordsString, selectedWeather, allAttributes); 
      setRecommendation(result.recommendedOutfit);
      if (result.imagePromptDetails) {
        setOutfitImagePromptDetails(result.imagePromptDetails);
      }
      toast({ title: "推荐已准备好！", description: "我们为你找到了一套服装。" });
    } catch (error) {
      toast({
        title: '获取推荐失败',
        description: error instanceof Error ? error.message : '发生未知错误。',
        variant: 'destructive',
      });
      setRecommendation(null);
      setOutfitImagePromptDetails(null);
    } finally {
      setIsGettingRecommendation(false);
    }
  };

  useEffect(() => {
    if (outfitImagePromptDetails && !isGettingRecommendation) { // Ensure text recommendation is done
      const generateImage = async () => {
        setIsLoadingImage(true);
        setGeneratedImageUrl(null);
        try {
          const imageResult = await handleGenerateOutfitImageAction(outfitImagePromptDetails);
          setGeneratedImageUrl(imageResult.imageDataUri);
          toast({ title: "图片已生成！", description: "看看AI渲染的效果图。" });
        } catch (error) {
          toast({
            title: '生成图片失败',
            description: error instanceof Error ? error.message : '发生未知错误。',
            variant: 'destructive',
          });
          setGeneratedImageUrl(null);
        } finally {
          setIsLoadingImage(false);
        }
      };
      generateImage();
    }
  }, [outfitImagePromptDetails, toast, isGettingRecommendation]);
  
  if (isLoadingCloset && !myClosetItems.length) { 
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">正在加载您的衣橱...</p>
      </div>
    );
  }
  
  const canGetRecommendation = myClosetItems.length > 0 && 
                               selectedMoods.length > 0 && 
                               !!selectedWeather;

  return (
    <div className="container mx-auto font-sans">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">服装推荐</h1>
        <p className="text-muted-foreground mt-1">根据你的衣橱、心情和天气获取个性化搭配建议和AI效果图。</p>
      </header>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ClothingUploadForm onClothingAnalyzed={handleClothingAnalyzed} />
          <ClosetView
            myClosetItems={myClosetItems}
            defaultClothingItems={isLoggedIn ? [] : DEFAULT_CLOTHING_ITEMS} 
            onAddDefaultClothing={handleAddDefaultClothing}
            onRemoveMyClothing={handleRemoveMyClothing}
            isLoading={isLoadingCloset}
            isLoggedIn={isLoggedIn}
          />
        </div>

        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 self-start">
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
            disabled={!canGetRecommendation || isGettingRecommendation || isLoadingImage}
            className="w-full py-3 text-lg bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl shadow-md"
            size="lg"
          >
            {isGettingRecommendation ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                正在为你寻找风格...
              </>
            ) : isLoadingImage ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                生成效果图中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                获取服装推荐
              </>
            )}
          </Button>
          <RecommendationDisplay recommendation={recommendation} isLoading={isGettingRecommendation} />
          
          {(isLoadingImage || generatedImageUrl) && (
            <Card className={cn("shadow-lg rounded-xl", isLoadingImage ? "" : "animate-fadeIn")}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5 text-primary" /> AI效果图
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center min-h-[250px] bg-muted/30 rounded-lg p-2">
                {isLoadingImage && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
                {generatedImageUrl && !isLoadingImage && (
                  <Image
                    src={generatedImageUrl}
                    alt="AI 生成的服装效果图"
                    width={350}
                    height={350}
                    className="rounded-md object-contain max-h-[400px] shadow-md"
                    data-ai-hint="fashion outfit"
                  />
                )}
              </CardContent>
            </Card>
          )}
           {!recommendation && !generatedImageUrl && !isGettingRecommendation && !isLoadingImage && (
             <Card className="border-dashed border-primary/30 rounded-xl bg-primary/5">
              <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
                <Sparkles className="mx-auto h-12 w-12 mb-3 text-primary/70" />
                <p className="font-semibold">准备好获取您的专属搭配了吗？</p>
                <p className="text-sm">选择好心情和天气，AI 将为您呈现惊喜！</p>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
      
      <footer className="mt-12 pt-6 border-t text-center text-muted-foreground text-xs">
        <p>&copy; {new Date().getFullYear()} Clother (衣者). 由 AI 驱动。</p>
      </footer>
    </div>
  );
}
