
import { z } from 'zod';

export const ProfileFormSchema = z.object({
  gender: z.string().optional().nullable(),
  age: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(String(val).trim())),
    z.number({ invalid_type_error: "年龄必须是一个数字" }).int("年龄必须是整数").positive("年龄必须是正数").min(1, "年龄不能小于1").max(120, "年龄不能大于120").optional().nullable()
  ),
  stylePreferences: z.array(z.string()).optional().default([]),
  skinTone: z.string().max(50, "肤色描述请保持在50字以内").optional().nullable().transform(val => val === "" ? null : val),
  weight: z.preprocess(
    (val) => {
      const trimmedVal = String(val).trim();
      return (trimmedVal === "" || val === null || val === undefined ? undefined : parseInt(trimmedVal, 10));
    },
    z.number({ invalid_type_error: "体重必须是一个数字" })
     .int("体重必须是整数")
     .positive("体重必须是正数")
     .min(1, "体重数值过小")
     .max(300, "体重数值过大，请确认单位为公斤(kg)")
     .optional()
     .nullable()
  ),
  height: z.preprocess(
    (val) => {
      const trimmedVal = String(val).trim();
      return (trimmedVal === "" || val === null || val === undefined ? undefined : parseInt(trimmedVal, 10));
    },
    z.number({ invalid_type_error: "身高必须是一个数字" })
     .int("身高必须是整数")
     .positive("身高必须是正数")
     .min(50, "身高数值过小 (单位:cm)")
     .max(250, "身高数值过大 (单位:cm)")
     .optional()
     .nullable()
  ),
});

