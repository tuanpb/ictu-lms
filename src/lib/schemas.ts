/**
 * Định nghĩa các Zod Schemas cho validation dữ liệu.
 * Tất cả lỗi validation được viết bằng Tiếng Việt.
 */

import { z } from 'zod';

/** Schema đăng nhập */
export const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/** Schema đăng ký */
export const registerSchema = loginSchema;

export type RegisterFormData = z.infer<typeof registerSchema>;

/** Schema tạo đề thi */
export const examSchema = z.object({
  examCode: z
    .string()
    .min(1, 'Vui lòng nhập mã đề')
    .max(20, 'Mã đề không được quá 20 ký tự'),
  subjectId: z.string().min(1, 'Vui lòng chọn môn học'),
  totalQuestions: z
    .number()
    .min(1, 'Số câu hỏi phải lớn hơn 0')
    .max(200, 'Số câu hỏi không được quá 200'),
  answerString: z
    .string()
    .min(1, 'Vui lòng nhập chuỗi đáp án')
    .regex(/^[AaBbCcDd]+$/, 'Chuỗi đáp án chỉ được chứa các ký tự A, B, C, D'),
});

export type ExamFormData = z.infer<typeof examSchema>;
