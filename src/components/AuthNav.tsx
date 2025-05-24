
'use client';

import Link from 'next/link';
import React, { useRef } from 'react'; // Added useRef
import { LogIn, LogOut, UserPlus, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Button is still used for non-trigger elements
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
import { cn } from '@/lib/utils'; // For potential class merging

interface AuthNavProps {
  user: Pick<User, 'id' | 'username'> | null;
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
          {/* DropdownMenuTrigger now takes Button props and children directly */}
          <DropdownMenuTrigger variant="ghost" className="flex items-center gap-2">
            <UserCircle size={20} />
            <span className="hidden sm:inline">{user.username}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>我的账户</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Hidden form, triggered by DropdownMenuItem's onSelect */}
            <form action={logout} ref={logoutFormRef} className="w-full" style={{ display: 'none' }}>
              <button type="submit" />
            </form>
            <DropdownMenuItem 
              onSelect={handleLogoutSelect} 
              className="w-full text-left flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={16} />
              登出
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          {/* Button component is used directly here, no asChild involvement */}
          <Button aschild variant="ghost" size="sm">
            <Link href="/login" className="flex items-center gap-1.5">
              <LogIn size={16} />
              登录
            </Link>
          </Button>
          <Button aschild variant="default" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
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
