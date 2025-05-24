
'use client';

import Link from 'next/link';
import React, { useRef } from 'react';
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

  const handleLogoutSelect = () => {
    logoutFormRef.current?.requestSubmit();
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
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 w-full">
                <Settings size={16} />
                用户中心
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={logout} ref={logoutFormRef} className="w-full" style={{ display: 'none' }}>
              <button type="submit" />
            </form>
            <DropdownMenuItem 
              onSelect={handleLogoutSelect} 
              className="w-full text-left flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut size={16} />
              登出
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
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
