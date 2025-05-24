
'use server';

import pool from '@/lib/db';
import type { ClothingItem } from '@/lib/definitions';
import { getUserFromSession } from './userActions'; // Assuming this is where getUserFromSession is
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

// Helper function to stringify attributes for DB, and parse when fetching
function serializeAttributes(attributes: string[]): string {
  return JSON.stringify(attributes);
}

function deserializeAttributes(attributesJson: string | null | undefined): string[] {
  if (!attributesJson) return [];
  try {
    const parsed = JSON.parse(attributesJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse attributes JSON from DB:", attributesJson, e);
    return [];
  }
}


export async function getClosetItems(): Promise<ClothingItem[]> {
  const user = await getUserFromSession();
  if (!user?.id) {
    // For non-logged-in users, return an empty array or default items if you prefer
    // For this prototype, we return empty, local state will handle defaults/uploads
    return []; 
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, image_url, attributes, is_default, created_at FROM clothing_items WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      imageUrl: row.image_url,
      attributes: deserializeAttributes(row.attributes), // attributes is stored as JSON string
      isDefault: !!row.is_default,
      user_id: user.id,
      created_at: new Date(row.created_at).toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching closet items:', error);
    throw new Error('获取衣橱物品失败。');
  }
}

export async function addClothingItem(itemData: Omit<ClothingItem, 'user_id' | 'created_at' | 'isDefault'>): Promise<ClothingItem | { error: string }> {
  const user = await getUserFromSession();
  if (!user?.id) {
    return { error: '用户未登录，无法添加衣物。' };
  }

  const newItem: ClothingItem = {
    ...itemData,
    id: itemData.id || `db-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Ensure ID for DB
    user_id: user.id,
    isDefault: false, // User-added items are not default
    created_at: new Date().toISOString(),
  };

  try {
    await pool.query(
      'INSERT INTO clothing_items (id, user_id, name, image_url, attributes, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [newItem.id, newItem.user_id, newItem.name, newItem.imageUrl, serializeAttributes(newItem.attributes), newItem.isDefault, newItem.created_at]
    );
    return newItem;
  } catch (error) {
    console.error('Error adding clothing item to DB:', error);
    return { error: '添加衣物到数据库失败。' };
  }
}


export async function removeClothingItem(itemId: string): Promise<{ success?: boolean; error?: string }> {
  const user = await getUserFromSession();
  if (!user?.id) {
    return { error: '用户未登录，无法移除衣物。' };
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM clothing_items WHERE id = ? AND user_id = ?',
      [itemId, user.id]
    );
    if (result.affectedRows > 0) {
      return { success: true };
    }
    return { error: '未找到要移除的衣物，或权限不足。' };
  } catch (error) {
    console.error('Error removing clothing item from DB:', error);
    return { error: '从数据库移除衣物失败。' };
  }
}

