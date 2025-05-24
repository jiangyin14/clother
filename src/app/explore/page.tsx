
// src/app/explore/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sparkles, Image as ImageIcon, Wand2, RefreshCw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MoodWeatherInput from '@/components/MoodWeatherInput';
import { EXPLORABLE_ITEMS, MOOD_OPTIONS, WEATHER_OPTIONS } from '@/lib/constants';
import type { ExplorableItem } from '@/lib/definitions';
import { handleExploreOutfitAction, handleGenerateOutfitImageAction } from '@/lib/actions';
import { cn } from '@/lib/utils';

export default function ExplorePage() {
  const [selectedItems, setSelectedItems] = useState<ExplorableItem[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedWeather, setSelectedWeather] = useState<string>(''); // Initial empty, will be auto-filled
  const [outfitRecommendation, setOutfitRecommendation] = useState<string | null>(null);
  const [outfitImagePromptDetails, setOutfitImagePromptDetails] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [clientLoaded, setClientLoaded] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    setClientLoaded(true);
  }, []);

  const handleItemSelection = (item: ExplorableItem, checked: boolean) => {
    setSelectedItems(prev =>
      checked ? [...prev, item] : prev.filter(i => i.id !== item.id)
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
    setIsLoadingImage(true); // Assume image will be generated too
    if (!isRefresh) { // Only reset if not a refresh, to keep previous result visible during refresh
        setOutfitRecommendation(null);
        setGeneratedImageUrl(null);
        setOutfitImagePromptDetails(null);
    }
    setShowResults(true);


    const selectedItemNames = selectedItems.map(item => item.name);
    const moodKeywordsString = selectedMoods.join(', ');

    try {
      const result = await handleExploreOutfitAction(selectedItemNames, moodKeywordsString, selectedWeather);
      setOutfitRecommendation(result.description);
      setOutfitImagePromptDetails(result.imagePromptDetails);
      if (!isRefresh) {
        toast({ title: "探索建议已生成！", description: "看看这个新搭配想法。" });
      } else {
        toast({ title: "已为你“换”一批新的建议！", description: "看看这个新搭配想法。" });
      }
      
      if (result.imagePromptDetails) {
        const imageResult = await handleGenerateOutfitImageAction(result.imagePromptDetails);
        setGeneratedImageUrl(imageResult.imageDataUri);
        toast({ title: "图片已生成！", description: "看看AI渲染的效果图。" });
      } else {
         setGeneratedImageUrl(null); // Clear previous image if no new prompt
      }

    } catch (error) {
      toast({
        title: isRefresh ? '“换一批”失败' : '获取探索建议失败',
        description: error instanceof Error ? error.message : '发生未知错误。',
        variant: 'destructive',
      });
       if (!isRefresh) setShowResults(false); // Hide results section if initial fetch failed
    } finally {
      setIsLoadingRecommendation(false);
      setIsLoadingImage(false);
    }
  }, [selectedItems, selectedMoods, selectedWeather, toast]);


  if (!clientLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const canSubmit = selectedItems.length > 0 && selectedMoods.length > 0 && !!selectedWeather;

  return (
    <div className="container mx-auto font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
          <Search className="inline-block h-10 w-10 mr-3 text-primary" />
          探索新风格
        </h1>
        <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
          选择你感兴趣的衣物、风格或配饰，结合你的心情和天气，让AI为你量身打造全新搭配，并生成令人惊艳的效果图。
        </p>
      </header>

      <Separator className="my-8" />

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl">1. 选择探索元素</CardTitle>
              <CardDescription>勾选你想要尝试的衣物、风格或配饰，激发AI的创意火花。</CardDescription>
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
                    <TableRow key={item.id} data-state={selectedItems.some(si => si.id === item.id) ? 'selected' : ''} className="data-[state=selected]:bg-primary/10">
                      <TableCell>
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={selectedItems.some(si => si.id === item.id)}
                          onCheckedChange={(checked) => handleItemSelection(item, !!checked)}
                          aria-label={`选择 ${item.name}`}
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

        <div className="lg:col-span-3 space-y-8 lg:sticky lg:top-8 self-start">
          <MoodWeatherInput
            selectedMoods={selectedMoods}
            onMoodSelectionChange={setSelectedMoods}
            selectedWeather={selectedWeather}
            onWeatherChange={setSelectedWeather}
            weatherOptions={WEATHER_OPTIONS}
            moodOptions={MOOD_OPTIONS}
          />
          
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl">3. 生成搭配</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => generateNewOutfit(false)}
                disabled={isLoadingRecommendation || isLoadingImage || !canSubmit}
                className="w-full py-3 text-lg bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg"
                size="lg"
              >
                {isLoadingRecommendation ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    生成搭配中...
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
                  className="w-full rounded-lg"
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

          {showResults && (
            <div className={cn("space-y-6", (isLoadingRecommendation || isLoadingImage) ? "" : "animate-fadeIn")}>
              {outfitRecommendation && (
                <Card className="shadow-lg rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center"><Sparkles className="mr-2 h-5 w-5 text-primary" /> AI搭配建议</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{outfitRecommendation}</p>
                  </CardContent>
                </Card>
              )}

              {(isLoadingImage || generatedImageUrl) && (
                <Card className="shadow-lg rounded-xl">
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
            </div>
          )}
          
          {!showResults && !isLoadingRecommendation && !isLoadingImage && (
             <Card className="border-dashed border-primary/30 rounded-xl bg-primary/5">
              <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
                <Wand2 className="mx-auto h-12 w-12 mb-3 text-primary/70" />
                <p className="font-semibold">准备好探索你的新造型了吗？</p>
                <p className="text-sm">选择一些元素，设定好场景，AI 将为你呈现惊喜！</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <footer className="mt-16 pt-8 border-t text-center text-muted-foreground text-xs">
        <p>&copy; {new Date().getFullYear()} Clother (衣者). 由 AI 驱动，创造无限时尚可能。</p>
      </footer>
    </div>
  );
}
