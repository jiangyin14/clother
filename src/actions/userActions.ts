
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { getIronSession, IronSession } from 'iron-session';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import type { User, AuthFormState } from '@/lib/definitions';
import { hashPassword, verifyPassword } from '@/lib/passwordUtils';
import { sessionOptions } from '@/lib/session';
import type { RowDataPacket } from 'mysql2';
import { verifyTurnstileToken } from '@/lib/turnstile'; // Import Turnstile verification

// Define the shape of your session data
interface AppSessionData {
  user?: Pick<User, 'id' | 'username'>;
}

const RegisterSchema = z.object({
  username: z.string().min(3, '用户名至少需要3个字符').max(50, '用户名不能超过50个字符'),
  password: z.string().min(6, '密码至少需要6个字符'),
  confirmPassword: z.string(),
  turnstileToken: z.string().min(1, '请完成人机验证。'), // Added Turnstile token
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'], // Path of error
});

const LoginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
  turnstileToken: z.string().min(1, '请完成人机验证。'), // Added Turnstile token
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

  const { username, password, turnstileToken } = validatedFields.data;

  // Verify Turnstile token
  const isHuman = await verifyTurnstileToken(turnstileToken);
  if (!isHuman) {
    return { message: '人机验证失败，请重试。' };
  }

  try {
    const [existingUsers] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return { message: '用户名已存在。' };
    }

    const hashedPassword = await hashPassword(password);
    await pool.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashedPassword]);

  } catch (error) {
    console.error('Registration error:', error);
    return { message: '注册过程中发生错误，请稍后重试。' };
  }
  const message = encodeURIComponent('注册成功！请登录。');
  redirect(`/login?message=${message}`);
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

  const { username, password, turnstileToken } = validatedFields.data;

  // Verify Turnstile token
  const isHuman = await verifyTurnstileToken(turnstileToken);
  if (!isHuman) {
    return { message: '人机验证失败，请重试。' };
  }

  try {
    const [users] = await pool.query<RowDataPacket[]>('SELECT id, username, password_hash FROM users WHERE username = ?', [username]);
    const userRow = users[0] as User & { password_hash: string } | undefined;

    if (!userRow) {
      return { message: '用户名或密码错误。' };
    }

    const passwordsMatch = await verifyPassword(password, userRow.password_hash);
    if (!passwordsMatch) {
      return { message: '用户名或密码错误。' };
    }

    const cookieStore = await cookies();
    const session = await getIronSession<AppSessionData>(cookieStore, sessionOptions);
    session.user = {
      id: userRow.id,
      username: userRow.username,
    };
    await session.save();

  } catch (error) {
    console.error('Login error:', error);
    return { message: '登录过程中发生错误，请稍后重试。' };
  }
  redirect('/');
}

export async function logout() {
  const cookieStore = await cookies();
  const session = await getIronSession<AppSessionData>(cookieStore, sessionOptions);
  await session.destroy();
  const message = encodeURIComponent('您已成功登出。');
  redirect(`/login?message=${message}`);
}

export async function getUserFromSession(): Promise<Pick<User, 'id' | 'username'> | null> {
  const cookieStore = await cookies();
  const session = await getIronSession<AppSessionData>(cookieStore, sessionOptions);
  return session.user || null;
}
