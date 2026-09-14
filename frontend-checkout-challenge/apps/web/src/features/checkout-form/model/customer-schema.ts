import { z } from 'zod';

export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Слишком коротко.')
    .max(100, 'Слишком длинно.'),
  email: z.string().trim().min(1, 'Укажите email.').email('Проверьте формат email.'),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{9,14}$/, 'Введите номер телефона полностью.'),
});

export type CustomerValues = z.infer<typeof customerSchema>;

export const INITIAL_CUSTOMER: CustomerValues = { name: '', email: '', phone: '' };
