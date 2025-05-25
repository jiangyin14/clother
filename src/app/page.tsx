
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { WEATHER_OPTIONS, MOOD_OPTIONS } from '@/lib/constants';
import { handleGetRecommendationAction, handleGenerateOutfitImageAction } from '@/lib/actions'; // Server Actions
import { shareOutfitToShowcase } from '@/actions/showcaseActions'; // Server Action for sharing
import { useToast } from '@/hooks/use-toast';

import MoodWeatherInput from '@/components/MoodWeatherInput';
import RecommendationDisplay from '@/components/RecommendationDisplay';
import CreativitySlider from '@/components/CreativitySlider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sparkles, Image as ImageIcon, Lightbulb, Share2, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { getUserFromSession } from '@/actions/userActions';
import { cn } from '@/lib/utils';

export default function RecommendationPage() {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedWeather, setSelectedWeather] = useState<string>('');
  const [creativityLevel, setCreativityLevel] = useState<number>(5);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [outfitImagePromptDetails, setOutfitImagePromptDetails] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGettingRecommendation, setIsGettingRecommendation] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clientLoaded, setClientLoaded] = useState(false);
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

  const handleGetRecommendation = async () => {
    if (selectedMoods.length === 0) {
      toast({ title: "缺少心情", description: "请选择你当前的心情。", variant: "destructive" });
      return;
    }
    if (!selectedWeather) {
      toast({ title: "缺少天气", description: "请选择或自动获取天气信息。", variant: "destructive" });
      return;
    }

    setIsGettingRecommendation(true);
    setRecommendation(null);
    setOutfitImagePromptDetails(null);
    setGeneratedImageUrl(null);
    setHasShared(false); // Reset sharing status for new recommendation

    const moodKeywordsString = selectedMoods.join(', ');

    try {
      const result = await handleGetRecommendationAction(moodKeywordsString, selectedWeather, creativityLevel);

      if (result.error) {
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
          // Toast for image generation can be optional if the main recommendation toast is enough
          // toast({ title: "图片已生成！", description: "看看AI渲染的效果图。" });
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

  const handleShare = async () => {
    if (!isLoggedIn) {
      toast({ title: "请先登录", description: "登录后才能分享您的穿搭哦！", variant: "default" });
      return;
    }
    if (!recommendation || !generatedImageUrl) {
      toast({ title: "信息不完整", description: "需要有效的穿搭描述和图片才能分享。", variant: "destructive" });
      return;
    }

    setIsSharing(true);
    try {
      const result = await shareOutfitToShowcase({
        outfitDescription: recommendation,
        imageDataUri: generatedImageUrl,
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

  const canGetRecommendation = selectedMoods.length > 0 && !!selectedWeather;
  const canShare = isLoggedIn && recommendation && generatedImageUrl && !isSharing && !hasShared;

  return (
    <div className="container mx-auto font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl flex items-center justify-center">
          <Lightbulb className="inline-block h-8 w-8 md:h-10 md:w-10 mr-3 text-primary" />
          智能服装推荐
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
          根据您的心情、天气和创意偏好，从您的衣橱（需登录）中获取个性化搭配建议和AI效果图。
        </p>
      </header>

      <Separator className="my-8" />

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
          <CreativitySlider
            value={creativityLevel}
            onValueChange={setCreativityLevel}
            disabled={isGettingRecommendation || isLoadingImage}
          />
          <Button
            onClick={handleGetRecommendation}
            disabled={!canGetRecommendation || isGettingRecommendation || isLoadingImage}
            className="w-full py-3 text-base md:text-lg bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl shadow-md"
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
                <CardTitle className="flex items-center text-lg md:text-xl">
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
           {!recommendation && !generatedImageUrl && !isGettingRecommendation && !isLoadingImage && (
             <Card className="border-dashed border-primary/30 rounded-xl bg-primary/5">
              <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
                <Sparkles className="mx-auto h-12 w-12 mb-3 text-primary/70" />
                <p className="font-semibold text-lg md:text-xl">准备好获取您的专属搭配了吗？</p>
                <p className="text-sm sm:text-base">
                  选择好心情、天气和创意偏好，AI 将从您的衣橱（需登录并添加衣物）中为您呈现惊喜！
                  {!isLoggedIn && " 请先登录以使用您的在线衣橱。"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
