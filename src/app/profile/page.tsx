
"use client";

import React, { useState, useEffect, useTransition, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { updateUserProfile } from '@/actions/userActions';
import type { ProfileFormState, User } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import GenderSelect from '@/components/GenderSelect';
import AgeInput from '@/components/AgeInput';
import StylePreferencesInput from '@/components/StylePreferencesInput';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, UserCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { getUserFromSession } from '@/actions/userActions'; 
import { Skeleton } from '@/components/ui/skeleton';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          正在保存...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          保存更改
        </>
      )}
    </Button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [, startTransition] = useTransition(); 
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Form states
  const [ageValue, setAgeValue] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string | undefined>(undefined);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [skinToneValue, setSkinToneValue] = useState<string>('');
  const [weightValue, setWeightValue] = useState<string>('');

  const initialState: ProfileFormState = { message: undefined, errors: {}, success: false };
  const [state, dispatch] = useActionState(updateUserProfile, initialState);

 useEffect(() => {
    async function fetchUser() {
      setIsLoadingUser(true);
      try {
        const user = await getUserFromSession();
        if (user) {
          setCurrentUser(user);
          setSelectedGender(user.gender || undefined);
          setAgeValue(user.age?.toString() || '');
          setSelectedStyles(user.style_preferences || []);
          setSkinToneValue(user.skinTone || '');
          setWeightValue(user.weight?.toString() || '');
        } else {
          router.push('/login'); 
        }
      } catch (error) {
        toast({ title: "加载用户信息失败", description: "请稍后重试", variant: "destructive" });
      } finally {
        setIsLoadingUser(false);
      }
    }
    fetchUser();
  }, [router, toast]);


  useEffect(() => {
    if (state.success && state.message) {
      toast({ title: '成功', description: state.message });
      if (state.user) { 
        setCurrentUser(state.user);
        setSelectedGender(state.user.gender || undefined);
        setAgeValue(state.user.age?.toString() || '');
        setSelectedStyles(state.user.style_preferences || []);
        setSkinToneValue(state.user.skinTone || '');
        setWeightValue(state.user.weight?.toString() || '');
      }
       router.refresh(); 
    } else if (!state.success && state.message) {
      toast({ title: '更新失败', description: state.message, variant: 'destructive' });
    }
  }, [state, toast, router]);

  const handleStylePreferenceChange = (preferenceId: string, checked: boolean) => {
    setSelectedStyles(prev =>
      checked ? [...prev, preferenceId] : prev.filter(id => id !== preferenceId)
    );
  };
  
  const handleAgeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAgeValue(event.target.value);
  };

  const handleSkinToneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSkinToneValue(event.target.value);
  };

  const handleWeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWeightValue(event.target.value);
  };


  if (isLoadingUser) {
    return (
      <>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <UserCircle className="mr-3 h-7 w-7 text-primary" /> 用户中心
          </CardTitle>
          <CardDescription>管理您的个人信息和偏好设置。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Label>穿衣偏好</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        </CardContent>
        <CardFooter className="p-6">
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </>
    );
  }
  
  if (!currentUser) {
     return (
        <CardContent className="p-6 text-center">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>无法加载用户信息，请尝试重新登录。</AlertDescription>
            </Alert>
        </CardContent>
     );
  }


  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-bold">
          <UserCircle className="mr-3 h-8 w-8 text-primary" />
          用户中心
        </CardTitle>
        <CardDescription>查看和更新您的个人信息与穿衣偏好。当前用户: {currentUser.username}</CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <CardContent className="space-y-8 p-6">
          {state.message && !state.success && state.errors?.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.errors.general.join(', ')}</AlertDescription>
            </Alert>
          )}

          <GenderSelect 
            value={selectedGender} 
            onValueChange={setSelectedGender} 
          />
          <AgeInput 
            value={ageValue}
            onChange={handleAgeChange}
            error={state.errors?.age?.join(', ')}
          />
           <div className="space-y-2">
            <Label htmlFor="skinTone">肤色</Label>
            <Input
              id="skinTone"
              name="skinTone"
              type="text"
              placeholder="例如：白皙，自然，小麦色，古铜色等"
              value={skinToneValue}
              onChange={handleSkinToneChange}
            />
            {state?.errors?.skinTone && <p className="text-sm text-destructive">{state.errors.skinTone.join(', ')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">体重 (kg)</Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              placeholder="请输入您的体重 (单位: 公斤)"
              value={weightValue}
              onChange={handleWeightChange}
              min="1"
            />
            {state?.errors?.weight && <p className="text-sm text-destructive">{state.errors.weight.join(', ')}</p>}
          </div>
          <StylePreferencesInput 
            selectedPreferences={selectedStyles}
            onPreferenceChange={handleStylePreferenceChange}
          />
           {state.errors?.stylePreferences && <p className="text-sm text-destructive">{state.errors.stylePreferences.join(', ')}</p>}
            {selectedStyles.map(styleId => (
              <input type="hidden" name="stylePreferences" value={styleId} key={`hidden-style-${styleId}`} />
            ))}
        </CardContent>
        <CardFooter className="p-6 border-t mt-6">
          <SubmitButton />
        </CardFooter>
      </form>
    </>
  );
}
