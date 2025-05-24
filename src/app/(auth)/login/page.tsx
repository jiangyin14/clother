
'use client';

import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { useActionState, useState } from 'react'; // Added useState
import { login } from '@/actions/userActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert'; // Removed AlertTitle
import { LogIn } from 'lucide-react';
import TurnstileWidget from '@/components/TurnstileWidget'; // Import TurnstileWidget

function LoginButton({ disabled }: { disabled?: boolean }) { // Added disabled prop
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" aria-disabled={pending || disabled} disabled={pending || disabled}>
      {pending ? '登录中...' : '登录'}
    </Button>
  );
}

export default function LoginPage() {
  const [state, dispatch] = useActionState(login, undefined);
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  return (
    <Card className="shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
         <LogIn className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl">欢迎回来！</CardTitle>
        <CardDescription>请输入您的用户名和密码以登录 Clother (衣者)。</CardDescription>
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
            <Input id="username" name="username" type="text" placeholder="您的用户名" required />
            {state?.errors?.username && <p className="text-sm text-destructive">{state.errors.username.join(', ')}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
            {state?.errors?.password && <p className="text-sm text-destructive">{state.errors.password.join(', ')}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>人机验证</Label>
            <TurnstileWidget onTokenChange={setTurnstileToken} />
            <input type="hidden" name="turnstileToken" value={turnstileToken || ''} />
            {state?.errors?.turnstileToken && <p className="text-sm text-destructive">{state.errors.turnstileToken.join(', ')}</p>}
          </div>

        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <LoginButton disabled={!turnstileToken} />
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
