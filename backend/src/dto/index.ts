import { z } from 'zod';

export const signupDto = z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

export const loginDto = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const createEventDto = z.object({
    title: z.string().min(1).max(200),
});

export const submitQuestionDto = z.object({
    content: z.string().min(5, 'Min 5 characters').max(500, 'Max 500 characters').trim(),
});

export type SignupDto = z.infer<typeof signupDto>;
export type LoginDto = z.infer<typeof loginDto>;
export type CreateEventDto = z.infer<typeof createEventDto>;
export type SubmitQuestionDto = z.infer<typeof submitQuestionDto>;
