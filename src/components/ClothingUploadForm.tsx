
'use client';

import type { ChangeEvent } from 'react';
import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { handleIdentifyAttributesAction, handleGenerateClothingNameAction } from '@/lib/actions';
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
        title: '未选择图片',
        description: '请选择要上传的图片文件。',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const attributeResult = await handleIdentifyAttributesAction(imageDataUri);
      let itemName = fileName || '上传的物品';

      if (attributeResult.attributes && attributeResult.attributes.length > 0) {
        try {
          const nameResult = await handleGenerateClothingNameAction(attributeResult.attributes);
          itemName = nameResult.name;
          toast({
            title: '衣物名称已生成！',
            description: `名称: ${itemName}`,
          });
        } catch (nameError) {
          console.error('Failed to generate clothing name:', nameError);
          toast({
            title: '名称生成失败',
            description: nameError instanceof Error ? nameError.message : '使用默认文件名。',
            variant: 'destructive',
          });
        }
      }

      onClothingAnalyzed({
        name: itemName,
        imageUrl: imageDataUri,
        attributes: attributeResult.attributes,
      });
      toast({
        title: '属性已识别！',
        description: `找到属性: ${attributeResult.attributes.join('、') || '无'}`,
      });
      setImagePreview(null);
      setImageDataUri(null);
      setFileName('');
      const fileInput = document.getElementById('clothing-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      toast({
        title: '识别属性失败',
        description: error instanceof Error ? error.message : '发生未知错误。',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <UploadCloud className="text-primary" /> 添加新衣物
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-muted-foreground">上传你的衣物图片以分析其属性。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="clothing-upload" className="mb-2 block text-sm font-medium">衣物图片</Label>
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
            <Image src={imagePreview} alt="图片预览" width={200} height={200} className="rounded-md object-contain max-h-[200px]" data-ai-hint="clothing preview" />
          </div>
        )}

        <Button onClick={handleSubmit} disabled={isLoading || !imageDataUri} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-base" size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              分析中...
            </>
          ) : (
            '分析衣物'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClothingUploadForm;
