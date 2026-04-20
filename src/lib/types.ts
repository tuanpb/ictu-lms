/**
 * Định nghĩa các TypeScript Interface cho toàn bộ ứng dụng.
 * Bao gồm: User, Subject, Exam, Answer.
 */

/** Thông tin người dùng */
export interface User {
  id: string;
  fullName?: string;
  email: string;
  coin?: number;
  password?: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  dataUrl?: string;
  unlockCoin: number;
  examCount?: number;
}

/** Đáp án cho một câu hỏi */
export interface Answer {
  questionNumber: number;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  /** Nội dung câu hỏi (tuỳ chọn, dùng cho chế độ xem chi tiết) */
  questionText?: string;
  /** Nội dung các đáp án A, B, C, D */
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

/** Đề thi */
export interface Exam {
  id: string;
  examCode: string;
  subjectId: string;
  subjectName: string;
  totalQuestions: number;
  answers: Answer[];
  createdAt: string;
}

export interface TransactionLog {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description?: string;
  createdAt: string;
}
