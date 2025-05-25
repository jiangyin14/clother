
'use server';

import pool from '@/lib/db';
import { getUserFromSession } from '@/actions/userActions';
import type { SharedOutfit } from '@/lib/definitions';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

interface ShareOutfitData {
  outfitDescription: string;
  imageDataUri: string;
  moodKeywords: string;      // 新增
  weatherInformation: string; // 新增
}

export async function shareOutfitToShowcase(
  data: ShareOutfitData
): Promise<{ success: boolean; message?: string; outfitId?: number }> {
  const user = await getUserFromSession();
  if (!user || !user.id) {
    return { success: false, message: '用户未登录，无法分享穿搭。' };
  }

  const { outfitDescription, imageDataUri, moodKeywords, weatherInformation } = data;
  if (!outfitDescription || !imageDataUri) {
    return { success: false, message: '缺少穿搭描述或图片信息。' };
  }
  if (!moodKeywords || !weatherInformation) {
    return { success: false, message: '缺少心情或天气信息。' };
  }


  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO shared_outfits (user_id, username, user_gender, user_age, mood_keywords, weather_information, outfit_description, image_data_uri) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        user.id,
        user.username,
        user.gender || null,
        user.age || null,
        moodKeywords,
        weatherInformation,
        outfitDescription,
        imageDataUri,
      ]
    );

    if (result.affectedRows > 0) {
      return { success: true, message: '穿搭已成功分享！', outfitId: result.insertId };
    } else {
      return { success: false, message: '分享穿搭失败，请稍后重试。' };
    }
  } catch (error) {
    console.error('Error sharing outfit to showcase:', error);
    return { success: false, message: '分享穿搭时发生数据库错误。' };
  }
}

interface GetSharedOutfitsOptions {
  page?: number;
  limit?: number;
}

interface GetSharedOutfitsResult {
  outfits: SharedOutfit[];
  total: number;
  currentPage: number;
  totalPages: number;
  error?: string;
}

export async function getSharedOutfits(
  options: GetSharedOutfitsOptions = {}
): Promise<GetSharedOutfitsResult> {
  const { page = 1, limit = 12 } = options;
  const offset = (page - 1) * limit;

  try {
    const [outfitRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, user_id, username, user_gender, user_age, mood_keywords, weather_information, outfit_description, image_data_uri, created_at FROM shared_outfits ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [totalRows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as total FROM shared_outfits');
    const total = totalRows[0]?.total || 0;

    const outfits = outfitRows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      username: row.username,
      user_gender: row.user_gender,
      user_age: row.user_age,
      mood_keywords: row.mood_keywords,
      weather_information: row.weather_information,
      outfit_description: row.outfit_description,
      image_data_uri: row.image_data_uri,
      created_at: new Date(row.created_at).toISOString(),
    }));

    return {
      outfits,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error fetching shared outfits:', error);
    return {
      outfits: [],
      total: 0,
      currentPage: 1,
      totalPages: 0,
      error: '获取分享穿搭列表失败。',
    };
  }
}
