
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import type { User, AuthFormState, ProfileFormState } from '@/lib/definitions';
import { hashPassword, verifyPassword } from '@/lib/passwordUtils';
import { sessionOptions } from '@/lib/session';
import type { RowDataPacket } from 'mysql2';
import { verifyCaptchaToken } from '@/lib/captcha';
import { ProfileFormSchema } from '@/lib/schemas';

interface AppSessionData {
  user?: User;
}

const RegisterSchema = z.object({
  username: z.string().min(3, '用户名至少需要3个字符').max(50, '用户名不能超过50个字符'),
  password: z.string().min(6, '密码至少需要6个字符'),
  confirmPassword: z.string(),
  captchaToken: z.string().min(1, '请完成人机验证。'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

const LoginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
  captchaToken: z.string().min(1, '请完成人机验证。'),
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

  const { username, password, captchaToken } = validatedFields.data;

  const isHuman = await verifyCaptchaToken(captchaToken);
  if (!isHuman) {
    return { message: '人机验证失败，请重试。', errors: { captchaToken: ['验证无效'] } };
  }

  try {
    const [existingUsers] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return { message: '用户名已存在。' };
    }

    const hashedPassword = await hashPassword(password);
    await pool.query('INSERT INTO users (username, password_hash, oobe_completed) VALUES (?, ?, ?)', [username, hashedPassword, false]);

  } catch (error) {
    console.error('Registration error:', error);
    return { message: '注册过程中发生错误，请稍后重试。' };
  }
  const message = encodeURIComponent('注册成功！请登录以完成初始设置。');
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

  const { username, password, captchaToken } = validatedFields.data;

  const isHuman = await verifyCaptchaToken(captchaToken);
  if (!isHuman) {
    return { message: '人机验证失败，请重试。', errors: { captchaToken: ['验证无效'] } };
  }

  try {
    const [users] = await pool.query<RowDataPacket[]>('SELECT id, username, password_hash, gender, age, style_preferences, skin_tone, weight, oobe_completed FROM users WHERE username = ?', [username]);
    const userRow = users[0] as User & { password_hash: string; skin_tone?: string; weight?: number; } | undefined;

    if (!userRow) {
      return { message: '用户名或密码错误。' };
    }

    const passwordsMatch = await verifyPassword(password, userRow.password_hash);
    if (!passwordsMatch) {
      return { message: '用户名或密码错误。' };
    }

    const cookieStore = await cookies();
    const session = await getIronSession<AppSessionData>(cookieStore, sessionOptions);
    
    let stylePrefs: string[] = [];
    if (typeof userRow.style_preferences === 'string') {
        try {
            stylePrefs = JSON.parse(userRow.style_preferences);
        } catch (e) {
            console.error("Failed to parse style_preferences from DB string:", userRow.style_preferences);
            stylePrefs = []; 
        }
    } else if (Array.isArray(userRow.style_preferences)) {
        stylePrefs = userRow.style_preferences;
    }

    session.user = {
      id: userRow.id,
      username: userRow.username,
      gender: userRow.gender,
      age: userRow.age,
      style_preferences: stylePrefs,
      skinTone: userRow.skin_tone,
      weight: userRow.weight,
      oobe_completed: !!userRow.oobe_completed,
    };
    await session.save();

    if (!session.user.oobe_completed) {
      redirect('/profile/setup');
    }

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

export async function getUserFromSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const session = await getIronSession<AppSessionData>(cookieStore, sessionOptions);
  return session.user || null;
}

export async function updateUserProfile(
  prevState: ProfileFormState | undefined,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await getUserFromSession();
  if (!user?.id) {
    return { message: '用户未登录，无法更新信息。', errors: { general: ['用户未登录'] } };
  }

  const rawFormData = {
    gender: formData.get('gender') || undefined,
    age: formData.get('age'), 
    stylePreferences: formData.getAll('stylePreferences'), 
    skinTone: formData.get('skinTone') || undefined,
    weight: formData.get('weight'),
  };
  
  const validatedFields = ProfileFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      message: '表单校验失败，请检查输入。',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { gender, age, stylePreferences, skinTone, weight } = validatedFields.data;

  try {
    await pool.query(
      'UPDATE users SET gender = ?, age = ?, style_preferences = ?, skin_tone = ?, weight = ? WHERE id = ?',
      [
        gender || null, 
        age === undefined ? null : age, 
        JSON.stringify(stylePreferences || []), 
        skinTone || null,
        weight === undefined ? null : weight,
        user.id
      ]
    );

    const cookieStore = await cookies();
    const session = await getIronSession<AppSessionData>(cookieStore, sessionOptions);
    if (session.user) {
      session.user.gender = gender || null;
      session.user.age = age === undefined ? null : age;
      session.user.style_preferences = stylePreferences || [];
      session.user.skinTone = skinTone || null;
      session.user.weight = weight === undefined ? null : weight;
      await session.save();
    }
    
    const [updatedUserRows] = await pool.query<RowDataPacket[]>('SELECT id, username, gender, age, style_preferences, skin_tone, weight, oobe_completed FROM users WHERE id = ?', [user.id]);
    const updatedUser = updatedUserRows[0] as User | undefined;

    return { success: true, message: '个人信息已成功更新！', user: updatedUser };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { message: '更新个人信息失败，请稍后重试。', errors: { general: ['数据库操作失败'] } };
  }
}

export async function markOobeAsCompleted(): Promise<{ success: boolean; message?: string }> {
  const user = await getUserFromSession();
  if (!user?.id) {
    return { success: false, message: '用户未登录。' };
  }

  try {
    await pool.query('UPDATE users SET oobe_completed = ? WHERE id = ?', [true, user.id]);

    const cookieStore = await cookies();
    const session = await getIronSession<AppSessionData>(cookieStore, sessionOptions);
    if (session.user) {
      session.user.oobe_completed = true;
      await session.save();
    }
    return { success: true };
  } catch (error) {
    console.error('Error marking OOBE as completed:', error);
    return { success: false, message: '更新OOBE状态失败。' };
  }
}
