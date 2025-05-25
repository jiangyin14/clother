
'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { SharedOutfit } from '@/lib/definitions';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { UserCircle, Sparkles } from 'lucide-react';

interface SharedOutfitCardProps {
  outfit: SharedOutfit;
}

const SharedOutfitCard: React.FC<SharedOutfitCardProps> = ({ outfit }) => {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const timeAgo = formatDistanceToNow(new Date(outfit.created_at), { addSuffix: true, locale: zhCN });

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg rounded-xl h-full bg-card hover:shadow-2xl transition-shadow duration-300">
      <CardHeader className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            {/* Placeholder for potential user avatar image in the future */}
            <AvatarFallback className="bg-muted text-muted-foreground">
              {outfit.username ? getInitials(outfit.username) : <UserCircle size={24} />}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{outfit.username}</p>
            <p className="text-xs text-muted-foreground">
              {outfit.user_gender && `${outfit.user_gender}`}
              {outfit.user_gender && outfit.user_age ? ', ' : ''}
              {outfit.user_age && `${outfit.user_age}岁`}
              {!outfit.user_gender && !outfit.user_age && '信息未公开'}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <div className="aspect-[3/4] w-full relative mb-4 rounded-lg overflow-hidden bg-muted/30 shadow-inner">
          <Image
            src={outfit.image_data_uri}
            alt={`由 ${outfit.username} 分享的穿搭`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint="fashion outfit shared"
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-semibold leading-tight text-primary flex items-center">
            <Sparkles size={18} className="mr-2 flex-shrink-0" />
            穿搭描述
          </h3>
          <p className="text-sm text-foreground line-clamp-4 leading-relaxed">
            {outfit.outfit_description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t text-xs text-muted-foreground">
        分享于 {timeAgo}
      </CardFooter>
    </Card>
  );
};

export default SharedOutfitCard;
