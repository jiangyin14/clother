
'use client';

import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { useActionState, useState, useEffect } from 'react';
import { register } from '@/actions/userActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus } from 'lucide-react';
import CaptchaWidget from '@/components/CaptchaWidget';

function RegisterButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full text-base" aria-disabled={pending || disabled} disabled={pending || disabled} size="lg">
      {pending ? '注册中...' : '注册'}
    </Button>
  );
}

export default function RegisterPage() {
  const [state, dispatch] = useActionState(register, undefined);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetTrigger, setCaptchaResetTrigger] = useState(0);

  useEffect(() => {
    if (state) { 
      setCaptchaToken(null); 
      setCaptchaResetTrigger(prev => prev + 1); 
    }
  }, [state]);

  return (
    <Card className="shadow-xl">
      <CardHeader className="space-y-1 text-center">
         <div className="flex justify-center mb-4">
            <UserPlus className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">创建您的账户</CardTitle>
        <CardDescription className="text-sm sm:text-base text-muted-foreground">加入 Clother (衣者)，开启您的智能时尚之旅！</CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <CardContent className="space-y-4">
          {state?.message && (
             <Alert variant={state.errors || (state.message && !state.message.includes("成功")) ? "destructive" : "default"}>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input id="username" name="username" type="text" placeholder="设置您的用户名" required />
            {state?.errors?.username && <p className="text-sm text-destructive">{state.errors.username.join(', ')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input id="password" name="password" type="password" placeholder="设置您的密码 (至少6位)" required />
            {state?.errors?.password && <p className="text-sm text-destructive">{state.errors.password.join(', ')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="再次输入您的密码" required />
            {state?.errors?.confirmPassword && <p className="text-sm text-destructive">{state.errors.confirmPassword.join(', ')}</p>}
          </div>

          <div className="space-y-2">
            <Label>人机验证</Label>
            <CaptchaWidget
              onTokenChange={setCaptchaToken}
              className="mx-auto"
              resetTrigger={captchaResetTrigger}
            />
            <input type="hidden" name="captchaToken" value={captchaToken || ''} />
            {state?.errors?.captchaToken && <p className="text-sm text-destructive">{state.errors.captchaToken.join(', ')}</p>}
          </div>

        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <RegisterButton disabled={!captchaToken} />
           <p className="text-center text-sm text-muted-foreground">
            已经有账户了？{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              前往登录
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
