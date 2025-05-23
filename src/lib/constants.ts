import type { ClothingItem, WeatherOption } from '@/lib/definitions';
import { CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Sun, ThermometerSnowflake, Wind } from 'lucide-react';

export const DEFAULT_CLOTHING_ITEMS: ClothingItem[] = [
  {
    id: 'default-tshirt-blue',
    name: 'Blue Cotton T-Shirt',
    imageUrl: 'https://placehold.co/300x300.png',
    attributes: ['t-shirt', 'blue', 'cotton', 'casual', 'summer', 'spring'],
    isDefault: true,
  },
  {
    id: 'default-jeans-dark',
    name: 'Dark Wash Jeans',
    imageUrl: 'https://placehold.co/300x300.png',
    attributes: ['jeans', 'denim', 'dark blue', 'casual', 'all-season'],
    isDefault: true,
  },
  {
    id: 'default-sweater-gray',
    name: 'Gray Wool Sweater',
    imageUrl: 'https://placehold.co/300x300.png',
    attributes: ['sweater', 'gray', 'wool', 'cozy', 'winter', 'autumn', 'casual'],
    isDefault: true,
  },
  {
    id: 'default-dress-black',
    name: 'Black Formal Dress',
    imageUrl: 'https://placehold.co/300x300.png',
    attributes: ['dress', 'black', 'silk', 'formal', 'evening', 'elegant'],
    isDefault: true,
  },
  {
    id: 'default-shorts-khaki',
    name: 'Khaki Casual Shorts',
    imageUrl: 'https://placehold.co/300x300.png',
    attributes: ['shorts', 'khaki', 'cotton', 'casual', 'summer', 'warm weather'],
    isDefault: true,
  },
];

export const WEATHER_OPTIONS: WeatherOption[] = [
  { value: 'Sunny and Warm', label: 'Sunny and Warm', icon: Sun },
  { value: 'Partly Cloudy and Mild', label: 'Partly Cloudy and Mild', icon: CloudSun },
  { value: 'Overcast and Cool', label: 'Overcast and Cool', icon: CloudFog },
  { value: 'Light Rain', label: 'Light Rain', icon: CloudRain },
  { value: 'Heavy Rain and Windy', label: 'Heavy Rain and Windy', icon: Wind },
  { value: 'Snowy and Cold', label: 'Snowy and Cold', icon: CloudSnow },
  { value: 'Thunderstorms', label: 'Thunderstorms', icon: CloudLightning },
  { value: 'Freezing Cold', label: 'Freezing Cold', icon: ThermometerSnowflake },
];
