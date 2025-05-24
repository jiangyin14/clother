
import { z } from 'zod';

export const ProfileFormSchema = z.object({
  gender: z.string().optional().nullable(),
  age: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: "年龄必须是一个数字" }).int("年龄必须是整数").positive("年龄必须是正数").min(1, "年龄不能小于1").max(120, "年龄不能大于120").optional().nullable()
  ),
  stylePreferences: z.array(z.string()).optional().default([]),
});
