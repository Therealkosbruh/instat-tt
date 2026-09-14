import { z } from 'zod';

const DIGITS_ONLY = /^\d+$/;

export const addressSchema = z.object({
  city: z.string().trim().min(2, 'Слишком коротко.').max(100, 'Слишком длинно.'),
  street: z.string().trim().min(2, 'Слишком коротко.').max(150, 'Слишком длинно.'),
  house: z.string().trim().min(1, 'Укажите номер дома.').regex(DIGITS_ONLY, 'Только цифры.'),
  apartment: z
    .string()
    .trim()
    .regex(DIGITS_ONLY, 'Только цифры.')
    .or(z.literal(''))
    .optional(),
});

export type AddressValues = z.infer<typeof addressSchema>;

export const INITIAL_ADDRESS: AddressValues = { city: '', street: '', house: '', apartment: '' };
