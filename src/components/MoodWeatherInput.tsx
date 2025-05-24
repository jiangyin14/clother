
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { WeatherOption, MoodOption } from '@/lib/definitions';
import { Cloud, LocateFixed, CalendarDays, Loader2, AlertCircle } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface MoodWeatherInputProps {
  selectedMoods: string[];
  onMoodSelectionChange: (moods: string[]) => void;
  selectedWeather: string;
  onWeatherChange: (weather: string) => void;
  weatherOptions: WeatherOption[];
  moodOptions: MoodOption[];
}

// WMO Weather interpretation codes mapping to Chinese descriptions
// Reference: https://open-meteo.com/en/docs (Weather WMO Codes section)
const weatherCodeMap: Record<number, string> = {
  0: '晴朗',
  1: '基本晴朗',
  2: '局部多云',
  3: '阴天',
  45: '雾',
  48: '冻雾',
  51: '小毛毛雨',
  53: '中等毛毛雨',
  55: '大毛毛雨',
  56: '小冻毛毛雨',
  57: '大冻毛毛雨',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  66: '小冻雨',
  67: '大冻雨',
  71: '小雪',
  73: '中雪',
  75: '大雪',
  77: '米雪',
  80: '小阵雨',
  81: '中阵雨',
  82: '大阵雨',
  85: '小阵雪',
  86: '大阵雪',
  95: '雷暴',
  96: '雷暴伴有小冰雹',
  99: '雷暴伴有大冰雹',
};

function getWeatherDescription(code: number, temp?: number, tempMin?: number, tempMax?: number): string {
  const desc = weatherCodeMap[code] || '未知天气';
  if (temp !== undefined) {
    return `${desc}，当前 ${Math.round(temp)}°C`;
  }
  if (tempMin !== undefined && tempMax !== undefined) {
    return `${desc}，${Math.round(tempMin)}°C - ${Math.round(tempMax)}°C`;
  }
  return desc;
}


const MoodWeatherInput: React.FC<MoodWeatherInputProps> = ({
  selectedMoods,
  onMoodSelectionChange,
  selectedWeather,
  onWeatherChange,
  weatherOptions,
  moodOptions,
}) => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleMoodButtonClick = (moodValue: string) => {
    const newSelectedMoods = selectedMoods.includes(moodValue)
      ? selectedMoods.filter((m) => m !== moodValue)
      : [...selectedMoods, moodValue];
    onMoodSelectionChange(newSelectedMoods);
  };

  const fetchWeather = useCallback(async (lat: number, lon: number, date: Date) => {
    setIsLoadingWeather(true);
    setLocationError(null);
    const formattedDate = format(date, 'yyyy-MM-dd');
    let weatherApiUrl = '';

    if (isToday(date)) {
      weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
    } else {
      // For past or future dates (Open-Meteo allows up to 16 days forecast, and historical for past)
      weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&start_date=${formattedDate}&end_date=${formattedDate}`;
    }
    
    try {
      const response = await fetch(weatherApiUrl);
      if (!response.ok) {
        throw new Error(`天气API请求失败: ${response.status}`);
      }
      const data = await response.json();

      let weatherDesc = '无法获取天气信息';
      if (isToday(date) && data.current && data.current.weather_code !== undefined) {
        weatherDesc = getWeatherDescription(data.current.weather_code, data.current.temperature_2m);
         toast({ title: "当前天气已更新", description: weatherDesc });
      } else if (data.daily && data.daily.weather_code && data.daily.weather_code.length > 0) {
        const daily = data.daily;
        weatherDesc = getWeatherDescription(daily.weather_code[0], undefined, daily.temperature_2m_min[0], daily.temperature_2m_max[0]);
         toast({ title: `${format(date, 'MM月dd日')}天气已更新`, description: weatherDesc });
      } else {
        toast({ title: "天气信息不完整", description: "未能从API获取完整天气数据。", variant: "destructive" });
      }
      onWeatherChange(weatherDesc);

    } catch (error) {
      console.error("获取天气失败:", error);
      toast({
        title: '获取天气失败',
        description: error instanceof Error ? error.message : '请检查网络连接或稍后再试。',
        variant: 'destructive',
      });
      setLocationError('无法获取天气数据。');
    } finally {
      setIsLoadingWeather(false);
    }
  }, [onWeatherChange, toast]);

  const handleGetCurrentLocationWeather = () => {
    if (!navigator.geolocation) {
      setLocationError('您的浏览器不支持地理位置。');
      toast({ title: "地理位置错误", description: "您的浏览器不支持地理位置功能。", variant: "destructive"});
      return;
    }
    setIsLoadingWeather(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        setLatitude(lat);
        setLongitude(lon);
        const today = new Date();
        setSelectedDate(today); // Reset date to today for current weather
        fetchWeather(lat, lon, today);
      },
      (error) => {
        console.error("地理位置错误:", error);
        let message = '无法获取您的位置。';
        if (error.code === error.PERMISSION_DENIED) {
          message = '您已拒绝地理位置权限。请在浏览器设置中允许。';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = '位置信息不可用。';
        } else if (error.code === error.TIMEOUT) {
          message = '获取位置超时。';
        }
        setLocationError(message);
        toast({ title: "地理位置错误", description: message, variant: "destructive"});
        setIsLoadingWeather(false);
      }
    );
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      if (latitude && longitude) {
        fetchWeather(latitude, longitude, date);
      } else {
        toast({ title: "请先获取当前位置", description: "需要位置信息才能查询指定日期的天气。", variant: "default" });
        // Optionally, trigger handleGetCurrentLocationWeather() or prompt user
      }
    }
  };

  // Attempt to get location on mount if not already set
  useEffect(() => {
    if (!latitude && !longitude && !locationError) { // Only if no prior attempt or error
       // handleGetCurrentLocationWeather(); // You can choose to auto-fetch on mount or not
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run once on mount


  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl">2. 设置您的场景</CardTitle>
        <CardDescription>选择心情，自动获取或手动设定天气以获得最佳服装推荐。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="font-medium">你当前的心情</Label>
          <div className="flex flex-wrap gap-2 pt-1">
            {moodOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedMoods.includes(option.value) ? 'default' : 'outline'}
                onClick={() => handleMoodButtonClick(option.value)}
                size="sm"
                className="capitalize rounded-full px-3 py-1.5 text-xs sm:text-sm"
              >
                {option.icon && React.createElement(option.icon, { size: 16, className: "mr-1.5 flex-shrink-0" })}
                {option.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">选择一个或多个描述你心情的关键词。</p>
        </div>

        <div className="space-y-3">
          <Label className="font-medium flex items-center gap-2">
            <Cloud size={18} className="text-primary" />
            天气信息
          </Label>
          
          <Button 
            onClick={handleGetCurrentLocationWeather} 
            variant="outline" 
            className="w-full rounded-md"
            disabled={isLoadingWeather}
          >
            {isLoadingWeather && latitude === null ? ( // Loading initial location
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="mr-2 h-4 w-4" />
            )}
            获取当前位置天气
          </Button>

          {locationError && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle size={14} /> {locationError}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal rounded-md"
                  disabled={!latitude || !longitude || isLoadingWeather}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: zhCN }) : <span>选择日期</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  locale={zhCN}
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 90)) || date > new Date(new Date().setDate(new Date().getDate() + 15))} // Example: 90 days past, 15 days future
                />
              </PopoverContent>
            </Popover>
             {isLoadingWeather && latitude !== null && ( // Loading weather for a selected date
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            )}
          </div>
           <p className="text-xs text-muted-foreground">
            {latitude && longitude ? `当前位置：纬度 ${latitude.toFixed(2)}, 经度 ${longitude.toFixed(2)}` : '自动获取天气需位置权限。'}
          </p>
          <p className="text-xs text-muted-foreground">或者，您可以手动选择一个天气状况进行模拟：</p>
          <Select value={selectedWeather} onValueChange={onWeatherChange} disabled={isLoadingWeather}>
            <SelectTrigger id="weather-select" className="w-full rounded-md">
              <SelectValue placeholder="手动选择天气状况" />
            </SelectTrigger>
            <SelectContent>
              {weatherOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.icon && React.createElement(option.icon, { size: 16, className: "text-muted-foreground" })}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodWeatherInput;

