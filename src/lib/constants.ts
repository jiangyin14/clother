
import type { ClothingItem, WeatherOption, MoodOption, GenderOption, StylePreferenceOption } from '@/lib/definitions';
import { 
  CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Sun, ThermometerSnowflake, Wind, 
  Smile, Meh, Frown, Zap, Coffee, ShieldCheck, Heart, Lightbulb, PartyPopper, Waves, Focus, Briefcase, Feather, BatteryLow, AlertTriangle 
} from 'lucide-react';

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
  { value: '晴朗温暖', label: '晴朗温暖', icon: Sun },
  { value: '多云温和', label: '多云温和', icon: CloudSun },
  { value: '阴天凉爽', label: '阴天凉爽', icon: CloudFog },
  { value: '小雨', label: '小雨', icon: CloudRain },
  { value: '大雨有风', label: '大雨有风', icon: Wind },
  { value: '下雪寒冷', label: '下雪寒冷', icon: CloudSnow },
  { value: '雷暴', label: '雷暴', icon: CloudLightning },
  { value: '严寒', label: '严寒', icon: ThermometerSnowflake },
];

export const MOOD_OPTIONS: MoodOption[] = [
  // 积极情绪
  { value: '开心', label: '开心', icon: Smile },
  { value: '轻松', label: '轻松', icon: Coffee },
  { value: '活力', label: '活力', icon: Zap },
  { value: '自信', label: '自信', icon: ShieldCheck },
  { value: '浪漫', label: '浪漫', icon: Heart },
  { value: '创意', label: '创意', icon: Lightbulb },
  { value: '兴奋', label: '兴奋', icon: PartyPopper },
  
  // 中性/专注情绪
  { value: '平静', label: '平静', icon: Waves },
  { value: '专注', label: '专注', icon: Focus },
  { value: '正式', label: '正式', icon: Briefcase },
  { value: '休闲', label: '休闲', icon: Feather },

  // 消极情绪
  { value: '忧郁', label: '忧郁', icon: Frown },
  { value: '疲惫', label: '疲惫', icon: BatteryLow },
  { value: '焦虑', label: '焦虑', icon: AlertTriangle },
  { value: '无聊', label: '无聊', icon: Meh },
];

// EXPLORABLE_ITEMS is now dynamically generated. This constant is removed.

export const GENDER_OPTIONS: GenderOption[] = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' },
  { value: 'prefer_not_to_say', label: '不愿透露' },
];

export const STYLE_PREFERENCES_OPTIONS: StylePreferenceOption[] = [
  { id: 'casual', label: '休闲风' },
  { id: 'formal', label: '正式风' },
  { id: 'sporty', label: '运动风' },
  { id: 'streetwear', label: '街头潮流' },
  { id: 'minimalist', label: '简约风' },
  { id: 'vintage', label: '复古风' },
  { id: 'bohemian', label: '波西米亚' },
  { id: 'artsy', label: '文艺风' },
  { id: 'business', label: '商务风' },
  { id: 'elegant', label: '优雅风' },
  { id: 'preppy', label: '学院风' },
  { id: 'punk', label: '朋克风' },
  { id: 'ethnic', label: '民族风' },
  { id: 'hip_hop', label: '嘻哈风' },
];
