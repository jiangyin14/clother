import type { ClothingItem, WeatherOption } from '@/lib/definitions';
import { CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Sun, ThermometerSnowflake, Wind } from 'lucide-react';

export const DEFAULT_CLOTHING_ITEMS: ClothingItem[] = [
  {
    id: 'default-tshirt-blue',
    name: '蓝色棉质T恤',
    imageUrl: 'https://placehold.co/300x300.png',
    attributes: ['T恤', '蓝色', '棉布', '休闲', '夏季', '春季'],
    isDefault: true,
  },
  {
    id: 'default-jeans-dark',
    name: '深色水洗牛仔裤',
    imageUrl: 'https://placehold.co/300x300.png',
    attributes: ['牛仔裤', '丹宁布', '深蓝色', '休闲', '四季皆宜'],
    isDefault: true,
  },
  {
    id: 'default-sweater-gray',
    name: '灰色羊毛衫',
    imageUrl: 'https://placehold.co/300x300.png',
    attributes: ['毛衣', '灰色', '羊毛', '舒适', '冬季', '秋季', '休闲'],
    isDefault: true,
  },
  {
    id: 'default-dress-black',
    name: '黑色正装连衣裙',
    imageUrl: 'https://placehold.co/300x300.png',
    attributes: ['连衣裙', '黑色', '丝绸', '正装', '晚宴', '优雅'],
    isDefault: true,
  },
  {
    id: 'default-shorts-khaki',
    name: '卡其色休闲短裤',
    imageUrl: 'https://placehold.co/300x300.png',
    attributes: ['短裤', '卡其色', '棉布', '休闲', '夏季', '暖和天气'],
    isDefault: true,
  },
];

export const WEATHER_OPTIONS: WeatherOption[] = [
  { value: 'Sunny and Warm', label: '晴朗温暖', icon: Sun },
  { value: 'Partly Cloudy and Mild', label: '多云温和', icon: CloudSun },
  { value: 'Overcast and Cool', label: '阴天凉爽', icon: CloudFog },
  { value: 'Light Rain', label: '小雨', icon: CloudRain },
  { value: 'Heavy Rain and Windy', label: '大雨有风', icon: Wind },
  { value: 'Snowy and Cold', label: '下雪寒冷', icon: CloudSnow },
  { value: 'Thunderstorms', label: '雷暴', icon: CloudLightning },
  { value: 'Freezing Cold', label: '严寒', icon: ThermometerSnowflake },
];
