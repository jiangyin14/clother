'use client';

import type { ChangeEvent } from 'react';
import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { handleIdentifyAttributesAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { ClothingItem } from '@/lib/definitions';
import { UploadCloud, Loader2 } from 'lucide-react';

interface ClothingUploadFormProps {
  onClothingAnalyzed: (item: Omit<ClothingItem, 'id' | 'isDefault'>) => void;
}

const ClothingUploadForm: React.FC<ClothingUploadFormProps> = ({ onClothingAnalyzed }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setImageDataUri(null);
      setFileName('');
    }
  };

  const handleSubmit = async () => {
    if (!imageDataUri) {
      toast({
        title: 'No Image Selected',
        description: 'Please select an image file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await handleIdentifyAttributesAction(imageDataUri);
      onClothingAnalyzed({
        name: fileName || 'Uploaded Item',
        imageUrl: imageDataUri,
        attributes: result.attributes,
      });
      toast({
        title: 'Attributes Identified!',
        description: `Found attributes: ${result.attributes.join(', ') || 'None'}`,
      });
      // Reset form
      setImagePreview(null);
      setImageDataUri(null);
      setFileName('');
      // Clear file input visually (this is a bit tricky with controlled file inputs)
      const fileInput = document.getElementById('clothing-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      toast({
        title: 'Error Identifying Attributes',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <UploadCloud className="text-primary" /> Add New Clothing
        </CardTitle>
        <CardDescription>Upload an image of your clothing item to analyze its attributes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="clothing-upload" className="mb-2 block text-sm font-medium">Clothing Image</Label>
          <Input
            id="clothing-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file:text-primary file:font-semibold hover:file:bg-primary/10"
          />
        </div>

        {imagePreview && (
          <div className="mt-4 p-2 border rounded-md bg-muted/50 flex justify-center">
            <Image src={imagePreview} alt="Image preview" width={200} height={200} className="rounded-md object-contain max-h-[200px]" data-ai-hint="clothing preview" />
          </div>
        )}

        <Button onClick={handleSubmit} disabled={isLoading || !imageDataUri} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Clothing Item'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClothingUploadForm;
