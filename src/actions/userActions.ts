
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import type { User, AuthFormState } from '@/lib/definitions';
import { hashPassword, verifyPassword } from '@/lib/passwordUtils';
import { sessionOptions } from '@/lib/session';
import type { RowDataPacket } from 'mysql2';

const RegisterSchema = z.object({
  username: z.string().min(3, '用户名至少需要3个字符').max(50, '用户名不能超过50个字符'),
  password: z.string().min(6, '密码至少需要6个字符'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'], // Path of error
});

const LoginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
});

export async function register(
  prevState: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const validatedFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '表单校验失败，请检查输入。',
    };
  }

  const { username, password } = validatedFields.data;

  try {
    const [existingUsers] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return { message: '用户名已存在。' };
    }

    const hashedPassword = await hashPassword(password);
    await pool.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashedPassword]);
    
    // Optionally log in the user directly after registration
    // For simplicity, we'll redirect to login here
    // return { success: true, message: '注册成功！请登录。' };

  } catch (error) {
    console.error('Registration error:', error);
    return { message: '注册过程中发生错误，请稍后重试。' };
  }
  redirect('/login?message=注册成功！请登录。');
}

export async function login(
  prevState: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '表单校验失败，请检查输入。',
    };
  }
  
  const { username, password } = validatedFields.data;

  try {
    const [users] = await pool.query<RowDataPacket[]>('SELECT id, username, password_hash FROM users WHERE username = ?', [username]);
    const user = users[0] as User & { password_hash: string } | undefined;

    if (!user) {
      return { message: '用户名或密码错误。' };
    }

    const passwordsMatch = await verifyPassword(password, user.password_hash);
    if (!passwordsMatch) {
      return { message: '用户名或密码错误。' };
    }

    const session = await getIronSession(cookies(), sessionOptions);
    session.user = {
      id: user.id,
      username: user.username,
    };
    await session.save();

  } catch (error) {
    console.error('Login error:', error);
    return { message: '登录过程中发生错误，请稍后重试。' };
  }
  redirect('/'); // Redirect to homepage after successful login
}

export async function logout() {
  const session = await getIronSession(cookies(), sessionOptions);
  session.destroy();
  redirect('/login?message=您已成功登出。');
}

export async function getUserFromSession(): Promise<Pick<User, 'id' | 'username'> | null> {
  const session = await getIronSession(cookies(), sessionOptions);
  return session.user || null;
}
