
'use client';

import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { useActionState, useState, useEffect } from 'react';
import { login } from '@/actions/userActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn } from 'lucide-react';
import CaptchaWidget from '@/components/CaptchaWidget';
import {red} from "next/dist/lib/picocolors";

function LoginButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full text-base" aria-disabled={pending || disabled} disabled={pending || disabled} size="lg">
      {pending ? '登录中...' : '登录'}
    </Button>
  );
}

export default function LoginPage() {
  const [state, dispatch] = useActionState(login, undefined);
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetTrigger, setCaptchaResetTrigger] = useState(0);

  useEffect(() => {
    if (state) { 
      setCaptchaToken(null); 
      setCaptchaResetTrigger(prev => prev + 1); 
      if (state.success) {
        window.location.reload();
      }
    }
  }, [state]);

  return (
    <Card className="shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
         <LogIn className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">欢迎回来！</CardTitle>
        <CardDescription className="text-sm sm:text-base text-muted-foreground">
          请输入您的用户名和密码以登录 Clother (衣者)。<br></br>
          <br></br>
          Moonshot48 成都场路演试运行中！
          <br></br>
          欢迎使用<a style={{color: "purple"}}>示例用户（参看登录框提示）</a>体验功能，也可以注册您自己的账号。<br></br>
          <br></br>
          <p style={{color: "red"}}>出现任何卡顿/人机验证问题，请先试试刷新页面。</p>
        </CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <CardContent className="space-y-4">
          {message && !state?.message && (
            <Alert variant="default" className="bg-primary/10 border-primary/30 text-primary-foreground">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {state?.message && (
             <Alert variant={state.errors || (state.message && !state.message.includes("成功")) ? "destructive" : "default"}>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input id="username" name="username" type="text" placeholder="测试用户：test" required />
            {state?.errors?.username && <p className="text-sm text-destructive">{state.errors.username.join(', ')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input id="password" name="password" type="password" placeholder="测试密码：123456" required />
            {state?.errors?.password && <p className="text-sm text-destructive">{state.errors.password.join(', ')}</p>}
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
          <LoginButton disabled={!captchaToken} />
          <p className="text-center text-sm text-muted-foreground">
            还没有账户？{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              立即注册
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
