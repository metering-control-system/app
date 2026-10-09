import { z } from 'zod';

export const loginSchema = z.object({
    password: z.string().min(1, 'Введите пароль'),
    login: z.string().trim().min(1, 'Введите логин'),
});
