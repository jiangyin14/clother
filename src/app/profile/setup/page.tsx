
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { updateUserProfile, markOobeAsCompleted } from '@/actions/userActions';
import { ProfileFormSchema } from '@/lib/schemas'; // Updated import
import type { ProfileFormState, User } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import GenderSelect from '@/components/GenderSelect';
import AgeInput from '@/components/AgeInput';
import StylePreferencesInput from '@/components/StylePreferencesInput';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { getUserFromSession } from '@/actions/userActions'; // To fetch initial data if any


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          保存并继续...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          完成设置，开启时尚之旅！
        </>
      )}
    </Button>
  );
}

export default function OobePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const [ageValue, setAgeValue] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string | undefined>(undefined);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  const initialState: ProfileFormState = { message: undefined, errors: {}, success: false };
  const [state, dispatch] = useFormState(updateUserProfile, initialState);

  useEffect(() => {
    if (state.success && state.message) {
      toast({ title: '信息已保存', description: state.message });
      startTransition(async () => {
        const oobeResult = await markOobeAsCompleted();
        if (oobeResult.success) {
          toast({ title: '设置完成！', description: '欢迎使用 Clother (衣者)！' });
          router.push('/');
          router.refresh(); // Important to refresh layout and session data
        } else {
          toast({ title: '错误', description: oobeResult.message || '无法完成OOBE状态更新。', variant: 'destructive' });
        }
      });
    } else if (!state.success && state.message) {
      toast({ title: '保存失败', description: state.message, variant: 'destructive' });
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


  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">欢迎来到 Clother (衣者)！</CardTitle>
        <CardDescription>为了给您更好的个性化体验，请花几分钟完成以下初始设置。</CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <CardContent className="space-y-6 p-6">
          {state.message && !state.success && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.message}</AlertDescription>
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
          <StylePreferencesInput 
            selectedPreferences={selectedStyles}
            onPreferenceChange={handleStylePreferenceChange}
          />
           {state.errors?.stylePreferences && <p className="text-sm text-destructive">{state.errors.stylePreferences.join(', ')}</p>}

           {/* Hidden inputs for stylePreferences if using getAll in action */}
            {selectedStyles.map(styleId => (
              <input type="hidden" name="stylePreferences" value={styleId} key={`hidden-style-${styleId}`} />
            ))}
        </CardContent>
        <CardFooter className="p-6">
          <SubmitButton />
        </CardFooter>
      </form>
    </>
  );
}
