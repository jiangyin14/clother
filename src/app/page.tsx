
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
// ClothingItem and DEFAULT_CLOTHING_ITEMS are no longer directly managed here
import { WEATHER_OPTIONS, MOOD_OPTIONS } from '@/lib/constants';
import { handleGetRecommendationAction, handleGenerateOutfitImageAction } from '@/lib/actions';
// Closet actions (add, get, remove) are no longer directly used here
import { useToast } from '@/hooks/use-toast';

// ClothingUploadForm and ClosetView are moved to /closet page
import MoodWeatherInput from '@/components/MoodWeatherInput';
import RecommendationDisplay from '@/components/RecommendationDisplay';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sparkles, Image as ImageIcon, Lightbulb } from 'lucide-react'; // Added Lightbulb
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
// getUserFromSession might still be useful if we want to show a "login to save" type of message for non-closet features
import { getUserFromSession } from '@/actions/userActions'; 
import { cn } from '@/lib/utils';

export default function RecommendationPage() {
  // Removed closet-related states: myClosetItems, isLoadingCloset
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedWeather, setSelectedWeather] = useState<string>('');
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [outfitImagePromptDetails, setOutfitImagePromptDetails] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGettingRecommendation, setIsGettingRecommendation] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Keep for UI cues if needed
  const [clientLoaded, setClientLoaded] = useState(false);


  const { toast } = useToast();

  useEffect(() => {
    setClientLoaded(true);
    // Check login status for UI cues if necessary
    const checkLogin = async () => {
      const user = await getUserFromSession();
      setIsLoggedIn(!!user);
    };
    checkLogin();
  }, []);

  // Removed closet-specific handlers: fetchClosetItems, handleClothingAnalyzed, handleAddDefaultClothing, handleRemoveMyClothing

  const handleGetRecommendation = async () => {
    if (selectedMoods.length === 0) {
      toast({ title: "缺少心情", description: "请选择你当前的心情。", variant: "destructive" });
      return;
    }
    if (!selectedWeather) {
      toast({ title: "缺少天气", description: "请选择或自动获取天气信息。", variant: "destructive" });
      return;
    }
    // Removed check for myClosetItems.length, server action will handle empty closet
    
    setIsGettingRecommendation(true);
    setRecommendation(null);
    setOutfitImagePromptDetails(null);
    setGeneratedImageUrl(null);

    const moodKeywordsString = selectedMoods.join(', ');

    try {
      // clothingKeywords are no longer passed from here; server action will fetch them.
      const result = await handleGetRecommendationAction(moodKeywordsString, selectedWeather);
      
      if (result.error) { // Check for specific error from action
        toast({ title: '获取推荐失败', description: result.error, variant: 'destructive' });
        setRecommendation(null);
        setOutfitImagePromptDetails(null);
      } else {
        setRecommendation(result.recommendedOutfit);
        if (result.imagePromptDetails) {
          setOutfitImagePromptDetails(result.imagePromptDetails);
        }
        toast({ title: "推荐已准备好！", description: "我们为你找到了一套服装。" });
      }

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
    if (outfitImagePromptDetails && !isGettingRecommendation) {
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

  if (!clientLoaded) { // Simple loading state for initial client render
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Updated canGetRecommendation: no longer depends on closet items count on client
  const canGetRecommendation = selectedMoods.length > 0 && !!selectedWeather;

  return (
    <div className="container mx-auto font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl flex items-center justify-center">
          <Lightbulb className="inline-block h-10 w-10 mr-3 text-primary" />
          智能服装推荐
        </h1>
        <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
          根据您的心情和天气，从您的衣橱（需登录）中获取个性化搭配建议和AI效果图。
        </p>
      </header>

      <Separator className="my-8" />

      {/* Layout simplified: MoodWeatherInput and RecommendationDisplay are primary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6 md:sticky md:top-8 self-start">
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
        </div>

        <div className="md:col-span-2 space-y-6">
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
                <p className="text-sm">
                  选择好心情和天气，AI 将从您的衣橱（需登录并添加衣物）中为您呈现惊喜！
                  {!isLoggedIn && " 请先登录以使用您的在线衣橱。"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <footer className="mt-16 pt-8 border-t text-center text-muted-foreground text-xs">
        <p>&copy; {new Date().getFullYear()} Clother (衣者). 由 AI 驱动。</p>
      </footer>
    </div>
  );
}
