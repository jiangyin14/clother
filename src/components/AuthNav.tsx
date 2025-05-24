
'use client';

import Link from 'next/link';
import { LogIn, LogOut, UserPlus, UserCircle } from 'lucide-react';
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
  user: Pick<User, 'id' | 'username'> | null;
}

export default function AuthNav({ user }: AuthNavProps) {
  return (
    <div className="flex items-center gap-2">
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <UserCircle size={20} />
              <span className="hidden sm:inline">{user.username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>我的账户</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Add more items here like "Profile", "Settings" later if needed */}
            <form action={logout} className="w-full">
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full text-left flex items-center gap-2 cursor-pointer">
                  <LogOut size={16} />
                  登出
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login" className="flex items-center gap-1.5">
              <LogIn size={16} />
              登录
            </Link>
          </Button>
          <Button asChild variant="default" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
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
