'use client';

import React, { useState, useEffect } from 'react';
import type { ClothingItem } from '@/lib/definitions';
import { DEFAULT_CLOTHING_ITEMS, WEATHER_OPTIONS } from '@/lib/constants';
import { handleGetRecommendationAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

import AppLogo from '@/components/AppLogo';
import ClothingUploadForm from '@/components/ClothingUploadForm';
import ClosetView from '@/components/ClosetView';
import MoodWeatherInput from '@/components/MoodWeatherInput';
import RecommendationDisplay from '@/components/RecommendationDisplay';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sparkles } from 'lucide-react';

export default function Home() {
  const [myClosetItems, setMyClosetItems] = useState<ClothingItem[]>([]);
  const [mood, setMood] = useState<string>('');
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
      toast({ title: "Item Added", description: `${itemToAdd.name} added to your closet.` });
    } else {
      toast({ title: "Already Added", description: `${itemToAdd.name} is already in your closet.`, variant: "default" });
    }
  };

  const handleRemoveMyClothing = (idToRemove: string) => {
    setMyClosetItems((prevItems) => prevItems.filter((item) => item.id !== idToRemove));
    toast({ title: "Item Removed", description: "The item has been removed from your closet." });
  };

  const handleGetRecommendation = async () => {
    if (!mood.trim()) {
      toast({ title: "Missing Mood", description: "Please enter your current mood.", variant: "destructive" });
      return;
    }
    if (!selectedWeather) {
      toast({ title: "Missing Weather", description: "Please select the current weather.", variant: "destructive" });
      return;
    }
    if (myClosetItems.length === 0) {
      toast({ title: "Empty Closet", description: "Please add some clothing items to your closet first.", variant: "destructive" });
      return;
    }

    setIsGettingRecommendation(true);
    setRecommendation(null); // Clear previous recommendation

    const allAttributes = Array.from(new Set(myClosetItems.flatMap(item => item.attributes)));

    try {
      const result = await handleGetRecommendationAction(mood, selectedWeather, allAttributes);
      setRecommendation(result.recommendedOutfit);
      toast({ title: "Recommendation Ready!", description: "We've found an outfit for you." });
    } catch (error) {
      toast({
        title: 'Error Getting Recommendation',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
      setRecommendation(null);
    } finally {
      setIsGettingRecommendation(false);
    }
  };
  
  if (!clientLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      <header className="mb-8 text-center">
        <AppLogo />
        <p className="text-muted-foreground mt-2">Your personal AI fashion assistant.</p>
      </header>

      <Separator className="my-8" />

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <ClothingUploadForm onClothingAnalyzed={handleClothingAnalyzed} />
          <ClosetView
            myClosetItems={myClosetItems}
            defaultClothingItems={DEFAULT_CLOTHING_ITEMS}
            onAddDefaultClothing={handleAddDefaultClothing}
            onRemoveMyClothing={handleRemoveMyClothing}
          />
        </div>

        <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-8 self-start">
          <MoodWeatherInput
            mood={mood}
            onMoodChange={setMood}
            selectedWeather={selectedWeather}
            onWeatherChange={setSelectedWeather}
            weatherOptions={WEATHER_OPTIONS}
          />
          
          <Button 
            onClick={handleGetRecommendation} 
            disabled={isGettingRecommendation || myClosetItems.length === 0 || !mood.trim() || !selectedWeather}
            className="w-full py-3 text-lg bg-accent hover:bg-accent/90 text-accent-foreground"
            size="lg"
          >
            {isGettingRecommendation ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Finding Your Style...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Get Outfit Recommendation
              </>
            )}
          </Button>

          <RecommendationDisplay recommendation={recommendation} isLoading={isGettingRecommendation} />
        </div>
      </main>
      
      <footer className="mt-16 pt-8 border-t text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} 衣搭配. Powered by AI.</p>
      </footer>
    </div>
  );
}
