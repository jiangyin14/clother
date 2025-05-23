// src/app/explore/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sparkles, Image as ImageIcon, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MoodWeatherInput from '@/components/MoodWeatherInput';
import { EXPLORABLE_ITEMS, MOOD_OPTIONS, WEATHER_OPTIONS } from '@/lib/constants';
import type { ExplorableItem } from '@/lib/definitions';
import { handleExploreOutfitAction, handleGenerateOutfitImageAction } from '@/lib/actions';

export default function ExplorePage() {
  const [selectedItems, setSelectedItems] = useState<ExplorableItem[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedWeather, setSelectedWeather] = useState<string>(WEATHER_OPTIONS[0]?.value || '');
  const [outfitRecommendation, setOutfitRecommendation] = useState<string | null>(null);
  const [outfitImagePromptDetails, setOutfitImagePromptDetails] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [clientLoaded, setClientLoaded] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setClientLoaded(true);
  }, []);

  const handleItemSelection = (item: ExplorableItem, checked: boolean) => {
    setSelectedItems(prev =>
      checked ? [...prev, item] : prev.filter(i => i.id !== item.id)
    );
  };

  const handleGetExploration = async () => {
    if (selectedItems.length === 0) {
      toast({ title: "未选择物品", description: "请至少选择一个你想探索的衣物类型。", variant: "destructive" });
      return;
    }
    if (selectedMoods.length === 0) {
      toast({ title: "缺少心情", description: "请选择你当前的心情。", variant: "destructive" });
      return;
    }
    if (!selectedWeather) {
      toast({ title: "缺少天气", description: "请选择当前的天气。", variant: "destructive" });
      return;
    }

    setIsLoadingRecommendation(true);
    setOutfitRecommendation(null);
    setGeneratedImageUrl(null);
    setOutfitImagePromptDetails(null);

    const selectedItemNames = selectedItems.map(item => item.name);
    const moodKeywordsString = selectedMoods.join(', ');

    try {
      const result = await handleExploreOutfitAction(selectedItemNames, moodKeywordsString, selectedWeather);
      setOutfitRecommendation(result.description);
      setOutfitImagePromptDetails(result.imagePromptDetails); // Store details for image generation
      toast({ title: "探索建议已生成！", description: "看看这个新搭配想法。" });
      
      // Automatically trigger image generation if prompt details are available
      if (result.imagePromptDetails) {
        await handleGenerateImage(result.imagePromptDetails);
      }

    } catch (error) {
      toast({
        title: '获取探索建议失败',
        description: error instanceof Error ? error.message : '发生未知错误。',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  const handleGenerateImage = async (promptDetails: string) => {
    if (!promptDetails) {
      toast({ title: "无生图提示", description: "无法生成图片，缺少服装细节。", variant: "destructive" });
      return;
    }
    setIsLoadingImage(true);
    setGeneratedImageUrl(null);
    try {
      const imageResult = await handleGenerateOutfitImageAction(promptDetails);
      setGeneratedImageUrl(imageResult.imageDataUri);
      toast({ title: "图片已生成！", description: "看看AI渲染的效果图。" });
    } catch (error) {
      toast({
        title: '生成图片失败',
        description: error instanceof Error ? error.message : '发生未知错误。可能是内容安全策略导致，请尝试调整输入或重试。',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingImage(false);
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">探索新风格</h1>
        <p className="text-muted-foreground mt-1">选择一些你感兴趣的衣物类型，AI将为你搭配并生成效果图。</p>
      </header>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>选择探索元素</CardTitle>
              <CardDescription>勾选你想要尝试的衣物、风格或配饰。</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>描述</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {EXPLORABLE_ITEMS.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={selectedItems.some(si => si.id === item.id)}
                          onCheckedChange={(checked) => handleItemSelection(item, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 self-start">
          <Card>
            <CardHeader>
              <CardTitle>场景设定</CardTitle>
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
                onClick={handleGetExploration}
                disabled={isLoadingRecommendation || isLoadingImage || selectedItems.length === 0 || selectedMoods.length === 0 || !selectedWeather}
                className="w-full py-3 text-lg bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
              >
                {isLoadingRecommendation ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    获取搭配建议...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    获取搭配建议
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {outfitRecommendation && (
            <Card>
              <CardHeader>
                <CardTitle>AI搭配建议</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{outfitRecommendation}</p>
              </CardContent>
            </Card>
          )}

          {(isLoadingImage || generatedImageUrl) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon /> AI效果图
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center min-h-[200px]">
                {isLoadingImage && <Loader2 className="h-10 w-10 animate-spin text-primary" />}
                {generatedImageUrl && !isLoadingImage && (
                  <Image
                    src={generatedImageUrl}
                    alt="AI 生成的服装效果图"
                    width={300}
                    height={300}
                    className="rounded-md object-contain max-h-[400px]"
                    data-ai-hint="fashion outfit"
                  />
                )}
              </CardContent>
            </Card>
          )}
          {!isLoadingRecommendation && !isLoadingImage && !outfitRecommendation && !generatedImageUrl && (
             <Card className="border-dashed">
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Sparkles className="mx-auto h-10 w-10 mb-2" />
                <p>你的AI搭配建议和效果图将在这里显示。</p>
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
