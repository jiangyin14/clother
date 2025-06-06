
// src/app/explore/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sparkles, Image as ImageIcon, Wand2, RefreshCw, Search, CheckCircle2, ThumbsUp, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MoodWeatherInput from '@/components/MoodWeatherInput';
import CreativitySlider from '@/components/CreativitySlider';
import { MOOD_OPTIONS, WEATHER_OPTIONS } from '@/lib/constants';
import type { ExplorableItem } from '@/lib/definitions';
import { handleExploreOutfitAction, handleGenerateOutfitImageAction, handleGenerateExplorableItemsAction } from '@/lib/actions';
import { shareOutfitToShowcase } from '@/actions/showcaseActions';
import { getUserFromSession } from '@/actions/userActions';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';


export default function ExplorePage() {
  const [explorableItems, setExplorableItems] = useState<ExplorableItem[]>([]);
  const [isLoadingExplorable, setIsLoadingExplorable] = useState(true);
  const [selectedItems, setSelectedItems] = useState<ExplorableItem[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedWeather, setSelectedWeather] = useState<string>('');
  const [creativityLevel, setCreativityLevel] = useState<number>(5);
  const [outfitRecommendation, setOutfitRecommendation] = useState<string | null>(null);
  const [outfitImagePromptDetails, setOutfitImagePromptDetails] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [clientLoaded, setClientLoaded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setClientLoaded(true);
    const checkLogin = async () => {
      const user = await getUserFromSession();
      setIsLoggedIn(!!user);
    };
    checkLogin();
  }, []);

  const fetchExplorableItems = useCallback(async () => {
    setIsLoadingExplorable(true);
    try {
      const items = await handleGenerateExplorableItemsAction(12);
      setExplorableItems(items);
      setSelectedItems([]);
    } catch (error) {
      toast({
        title: "获取探索元素失败",
        description: error instanceof Error ? error.message : "无法连接到服务器获取探索灵感。",
        variant: "destructive",
      });
      setExplorableItems([]);
    } finally {
      setIsLoadingExplorable(false);
    }
  }, [toast]);

  useEffect(() => {
    if (clientLoaded) {
      fetchExplorableItems();
    }
  }, [clientLoaded, fetchExplorableItems]);

  const handleItemSelection = (itemToToggle: ExplorableItem) => {
    setSelectedItems(prev =>
      prev.find(item => item.id === itemToToggle.id)
        ? prev.filter(i => i.id !== itemToToggle.id)
        : [...prev, itemToToggle]
    );
  };

  const generateNewOutfit = useCallback(async (isRefresh: boolean = false) => {
    if (selectedItems.length === 0) {
      toast({ title: "未选择物品", description: "请至少选择一个你想探索的衣物类型。", variant: "destructive" });
      return;
    }
    if (selectedMoods.length === 0) {
      toast({ title: "缺少心情", description: "请选择你当前的心情。", variant: "destructive" });
      return;
    }
    if (!selectedWeather) {
      toast({ title: "缺少天气", description: "请选择或自动获取天气信息。", variant: "destructive" });
      return;
    }

    setIsLoadingRecommendation(true);
    setIsLoadingImage(true); // Start image loading along with recommendation
    if (!isRefresh) {
        setOutfitRecommendation(null);
        setGeneratedImageUrl(null);
        setOutfitImagePromptDetails(null);
        setHasShared(false); 
    }
    setShowResults(true);

    const selectedItemNames = selectedItems.map(item => item.name);
    const moodKeywordsString = selectedMoods.join(', ');

    try {
      // Get text recommendation and image prompt details
      const result = await handleExploreOutfitAction(selectedItemNames, moodKeywordsString, selectedWeather, creativityLevel);
      setOutfitRecommendation(result.description);
      setOutfitImagePromptDetails(result.imagePromptDetails);
      const messageTitle = isRefresh ? "已为你“换”一批新的建议！" : "探索建议已生成！";
      toast({ title: messageTitle, description: "看看这个新搭配想法。" });
      setIsLoadingRecommendation(false); // Text recommendation part is done

      // Generate image based on prompt details
      if (result.imagePromptDetails) {
        const imageResult = await handleGenerateOutfitImageAction(result.imagePromptDetails);
        setGeneratedImageUrl(imageResult.imageDataUri);
      } else {
         setGeneratedImageUrl(null);
      }

    } catch (error) {
      toast({
        title: isRefresh ? '“换一批”失败' : '获取探索建议失败',
        description: error instanceof Error ? error.message : '发生未知错误。',
        variant: 'destructive',
      });
       if (!isRefresh) setShowResults(false);
       setIsLoadingRecommendation(false); // Ensure loading state is reset on error
    } finally {
      // setIsLoadingRecommendation(false); // Moved up
      setIsLoadingImage(false); // Image generation attempt is complete
    }
  }, [selectedItems, selectedMoods, selectedWeather, creativityLevel, toast]);

  const handleShare = async () => {
    if (!isLoggedIn) {
      toast({ title: "请先登录", description: "登录后才能分享您的穿搭哦！", variant: "default" });
      return;
    }
    if (!outfitRecommendation || !generatedImageUrl || selectedMoods.length === 0 || !selectedWeather) {
      toast({ title: "信息不完整", description: "需要有效的穿搭描述、图片、心情和天气信息才能分享。", variant: "destructive" });
      return;
    }

    setIsSharing(true);
    try {
      const result = await shareOutfitToShowcase({
        outfitDescription: outfitRecommendation,
        imageDataUri: generatedImageUrl,
        moodKeywords: selectedMoods.join(', '),
        weatherInformation: selectedWeather,
      });
      if (result.success) {
        toast({ title: "分享成功！", description: "您的穿搭已成功分享到穿搭广场。" });
        setHasShared(true);
      } else {
        toast({ title: "分享失败", description: result.message || "无法分享您的穿搭，请稍后再试。", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "分享出错", description: error instanceof Error ? error.message : "发生未知错误。", variant: "destructive" });
    } finally {
      setIsSharing(false);
    }
  };

  if (!clientLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const canSubmit = selectedItems.length > 0 && selectedMoods.length > 0 && !!selectedWeather;
  const canShare = isLoggedIn && outfitRecommendation && generatedImageUrl && !isSharing && !hasShared && selectedMoods.length > 0 && !!selectedWeather;


  return (
    <div className="container mx-auto font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl flex items-center justify-center">
          <Search className="inline-block h-8 w-8 md:h-10 md:w-10 mr-3 text-primary" />
          探索新风格
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
          选择AI为你生成的时尚灵感，结合你的心情、天气和创意偏好，打造全新搭配并生成效果图。
        </p>
      </header>

      <Separator className="my-8" />

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* Left Column: Inspiration Selection & AI Image */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg md:text-xl">1. 选择探索灵感</CardTitle>
                  <CardDescription className="text-sm md:text-base text-muted-foreground">勾选你想要尝试的时尚元素，激发AI的创意火花。</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchExplorableItems}
                  disabled={isLoadingExplorable || isLoadingRecommendation || isLoadingImage}
                  className="rounded-lg text-sm"
                >
                  {isLoadingExplorable ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  换一批灵感
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingExplorable ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Adjusted grid for larger screens */}
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="h-[180px] flex flex-col justify-between p-4 rounded-lg">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-full mb-1" />
                      <Skeleton className="h-3 w-5/6 mb-3" />
                      <Skeleton className="h-8 w-full rounded-md" />
                    </Card>
                  ))}
                </div>
              ) : explorableItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Adjusted grid */}
                  {explorableItems.map(item => {
                    const isSelected = selectedItems.some(si => si.id === item.id);
                    return (
                      <Card
                        key={item.id}
                        className={cn(
                          "cursor-pointer hover:shadow-xl transition-all duration-200 ease-in-out flex flex-col rounded-lg overflow-hidden",
                          isSelected ? "border-primary ring-2 ring-primary shadow-lg" : "border-border"
                        )}
                        onClick={() => handleItemSelection(item)}
                      >
                        <CardHeader className="p-3 pb-1">
                          <CardTitle className="text-base font-semibold flex items-center justify-between">
                            <span className="truncate pr-2">{item.name}</span>
                            {isSelected && <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 text-sm text-muted-foreground flex-grow">
                          <p className="line-clamp-3">{item.description}</p>
                        </CardContent>
                        <CardFooter className="p-3 pt-2 mt-auto border-t">
                           <Button
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              className="w-full text-sm rounded-md"
                              onClick={(e) => { e.stopPropagation(); handleItemSelection(item); }}
                            >
                              {isSelected ? <><ThumbsUp className="mr-1.5 h-3.5 w-3.5"/>已选择</> : '选择此项'}
                            </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8 text-sm sm:text-base">未能加载探索元素，请稍后重试或点击“换一批灵感”。</p>
              )}
            </CardContent>
          </Card>

          {/* AI效果图 Card (Moved here) */}
          {showResults && (isLoadingImage || generatedImageUrl) && (
            <Card className={cn("shadow-lg rounded-xl", isLoadingImage ? "" : "animate-fadeIn")}>
              <CardHeader>
                <CardTitle className="flex items-center text-lg md:text-xl">
                  <ImageIcon className="mr-2 h-5 w-5 text-primary" /> AI效果图
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center min-h-[300px] sm:min-h-[400px] md:min-h-[500px] bg-muted/30 rounded-lg p-2"> {/* Increased min-height */}
                {isLoadingImage && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
                {generatedImageUrl && !isLoadingImage && (
                  <Image
                    src={generatedImageUrl}
                    alt="AI 生成的服装效果图"
                    width={500} // Adjusted width
                    height={600} // Adjusted height to allow more vertical space
                    className="rounded-md object-contain max-h-[400px] sm:max-h-[500px] md:max-h-[600px] shadow-md" // Responsive max-height
                    data-ai-hint="fashion outfit"
                  />
                )}
              </CardContent>
              {canShare && (
                <CardFooter className="p-4 border-t">
                   <Button onClick={handleShare} disabled={isSharing} className="w-full text-base" variant="outline">
                    {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                    {isSharing ? "分享中..." : "分享到穿搭广场"}
                  </Button>
                </CardFooter>
              )}
              {hasShared && (
                <CardFooter className="p-4 border-t justify-center">
                    <div className="flex items-center text-green-600">
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        <p className="text-sm font-medium">已成功分享！</p>
                    </div>
                </CardFooter>
              )}
            </Card>
          )}
        </div>

        {/* Right Column: Inputs & Text Recommendation (lg:col-span-3, sticky) */}
        <div className="lg:col-span-3 space-y-8 lg:sticky lg:top-8 self-start">
          <MoodWeatherInput
            selectedMoods={selectedMoods}
            onMoodSelectionChange={setSelectedMoods}
            selectedWeather={selectedWeather}
            onWeatherChange={setSelectedWeather}
            weatherOptions={WEATHER_OPTIONS}
            moodOptions={MOOD_OPTIONS}
          />

          <CreativitySlider
            value={creativityLevel}
            onValueChange={setCreativityLevel}
            disabled={isLoadingRecommendation || isLoadingImage}
          />

          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">生成搭配</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => generateNewOutfit(false)}
                disabled={isLoadingRecommendation || isLoadingImage || !canSubmit}
                className="w-full py-3 text-base md:text-lg bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg"
                size="lg"
              >
                {isLoadingRecommendation || isLoadingImage ? ( // Combined loading state for this button
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    获取搭配建议
                  </>
                )}
              </Button>
              {showResults && outfitRecommendation && (
                <Button
                  onClick={() => generateNewOutfit(true)}
                  disabled={isLoadingRecommendation || isLoadingImage || !canSubmit}
                  variant="outline"
                  className="w-full rounded-lg text-base md:text-lg"
                  size="lg"
                >
                  {isLoadingRecommendation || isLoadingImage ? (
                     <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                     <RefreshCw className="mr-2 h-5 w-5" />
                  )}
                  换一批试试
                </Button>
              )}
            </CardContent>
          </Card>

          {/* AI搭配建议 Card (Text Recommendation) */}
          {showResults && outfitRecommendation && !isLoadingRecommendation && ( // Only show when not loading recommendation
            <Card className={cn("shadow-lg rounded-xl animate-fadeIn")}>
              <CardHeader>
                <CardTitle className="flex items-center text-lg md:text-xl"><Sparkles className="mr-2 h-5 w-5 text-primary" /> AI搭配建议</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{outfitRecommendation}</p>
              </CardContent>
            </Card>
          )}
          {/* Skeleton for text recommendation */}
           {showResults && isLoadingRecommendation && (
             <Card className="shadow-lg rounded-xl">
               <CardHeader>
                  <CardTitle className="flex items-center text-lg md:text-xl"><Sparkles className="mr-2 h-5 w-5 text-primary" /> AI搭配建议</CardTitle>
               </CardHeader>
               <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
               </CardContent>
             </Card>
           )}


          {/* Placeholder when nothing is shown yet */}
          {!showResults && !isLoadingExplorable && !isLoadingRecommendation && !isLoadingImage && explorableItems.length > 0 && (
             <Card className="border-dashed border-primary/30 rounded-xl bg-primary/5">
              <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
                <Wand2 className="mx-auto h-12 w-12 mb-3 text-primary/70" />
                <p className="font-semibold text-lg md:text-xl">准备好探索你的新造型了吗？</p>
                <p className="text-sm sm:text-base">
                  从上方选择一些灵感元素，设定好场景和创意偏好，AI 将为你呈现惊喜！
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

