
'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Keep Link for the non-user section
import { LogIn, LogOut, UserPlus, UserCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/actions/userActions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from '@/lib/definitions';

interface AuthNavProps {
  user: User | null;
}

export default function AuthNav({ user }: AuthNavProps) {
  const logoutFormRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleLogoutSelect = () => {
    logoutFormRef.current?.requestSubmit();
  };

  const handleProfileSelect = () => {
    router.push('/profile');
  };

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger variant="ghost" className="flex items-center gap-2 px-2 py-1.5">
            <UserCircle size={20} />
            <span className="hidden sm:inline">{user.username}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>我的账户</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleProfileSelect}
              className="cursor-pointer" // className applies to the item itself
            >
              {/* Single child span for layout */}
              <span className="flex items-center gap-2 w-full">
                <Settings size={16} />
                用户中心
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={logout} ref={logoutFormRef} className="w-full" style={{ display: 'none' }}>
              <button type="submit" />
            </form>
            <DropdownMenuItem
              onSelect={handleLogoutSelect}
              className="w-full text-left cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              {/* Single child span for layout */}
              <span className="flex items-center gap-2">
                <LogOut size={16} />
                登出
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          {/* These Buttons use asChild with Link, which should be fine if Button component is robust.
              If these also cause issues, they'd need similar treatment or Link's legacyBehavior.
              However, the current error stack points to DropdownMenuItem. */}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login" className="flex items-center gap-1.5">
              <LogIn size={16} />
              登录
            </Link>
          </Button>
          <Button variant="default" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
            <Link href="/register" className="flex items-center gap-1.5">
              <UserPlus size={16} />
              注册
            </Link>
          </Button>
        </>
      )}
    </div>
  );
}
