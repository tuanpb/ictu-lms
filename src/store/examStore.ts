import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { message } from 'antd';
import type { Exam, Subject, Answer } from '../lib/types';
import { supabase } from '../lib/supabase';

interface ExamState {
  subjects: Subject[];
  lastFetchedSubjects: number | null;
  initialized: boolean;
  loading: boolean;
  loadingQuestions: boolean;
  currentExam: Exam | null;
  unlockedSubjectIds: string[];
  unlockedDataUrls: Record<string, string>; // Maps subjectId to dataUrl
  initializeData: () => Promise<void>;
  fetchSubjects: (forceRefresh?: boolean) => Promise<void>;
  fetchUnlockedSubjects: () => Promise<void>;
  fetchQuestionsFromUrl: (subjectId: string, url: string) => Promise<void>;
  unlockSubject: (subjectId: string, cost: number) => Promise<{ success: boolean; error?: string }>;
  getExamBySubject: (subjectId: string) => Exam | undefined;
}

const SUBJECT_CACHE_TTL = 1000 * 60 * 60; // 1 giờ

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      subjects: [],
      lastFetchedSubjects: null,
      initialized: false,
      loading: false,
      loadingQuestions: false,
      currentExam: null,
      unlockedSubjectIds: [],
      unlockedDataUrls: {},

      initializeData: async () => {
        await get().fetchSubjects();
        await get().fetchUnlockedSubjects();
        set({ initialized: true });
      },

      fetchUnlockedSubjects: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        // JOIN with subjects to get data_url securely
        const { data, error } = await supabase
          .from('user_subjects')
          .select('subject_id, subjects(data_url)')
          .eq('user_id', session.user.id);

        if (error) {
          console.error('Lỗi khi lấy danh sách môn học đã mua:', error);
          return;
        }

        if (data) {
          const ids: string[] = [];
          const urls: Record<string, string> = {};

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.forEach((item: any) => {
            if (item.subject_id) {
              ids.push(item.subject_id);
              const subjectData = Array.isArray(item.subjects) ? item.subjects[0] : item.subjects;
              if (subjectData?.data_url) {
                urls[item.subject_id] = subjectData.data_url;
              }
            }
          });

          set({
            unlockedSubjectIds: ids,
            unlockedDataUrls: urls
          });
        }
      },

      unlockSubject: async (subjectId: string, cost: number) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { success: false, error: 'Vui lòng đăng nhập để thực hiện' };

        const { data: profile } = await supabase
          .from('profiles')
          .select('coin')
          .eq('id', session.user.id)
          .single();

        if (!profile || (profile.coin || 0) < cost) {
          return { success: false, error: 'Số dư không đủ. Vui lòng nạp thêm Coin.' };
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ coin: (profile.coin || 0) - cost })
          .eq('id', session.user.id);

        if (updateError) return { success: false, error: 'Lỗi khi trừ Coin' };

        const { error: insertError } = await supabase
          .from('user_subjects')
          .insert({ user_id: session.user.id, subject_id: subjectId });

        if (insertError) {
          await supabase.from('profiles').update({ coin: profile.coin }).eq('id', session.user.id);
          return { success: false, error: 'Lỗi khi kích hoạt môn học' };
        }

        // Re-fetch to get the data_url for the newly unlocked subject
        await get().fetchUnlockedSubjects();

        return { success: true };
      },

      fetchQuestionsFromUrl: async (subjectId: string, url: string) => {
        if (!url) return;
        set({ loadingQuestions: true, currentExam: null });
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error('Không thể tải file dữ liệu');
          const data = await response.json();

          if (data && data.questions) {
            const subject = get().subjects.find(s => s.id === subjectId);
            const answers: Answer[] = data.questions.map((q: { qHtml?: string; optHtmlA?: string; optHtmlB?: string; optHtmlC?: string; optHtmlD?: string; correctIndex?: number }, index: number) => ({
              questionNumber: index + 1,
              // questionText: q.question,
              questionText: q.qHtml,
              options: {
                A: q.optHtmlA,
                B: q.optHtmlB,
                C: q.optHtmlC,
                D: q.optHtmlD,
              },
              correctAnswer: ['A', 'B', 'C', 'D'][q.correctIndex || 0] as 'A' | 'B' | 'C' | 'D',
            }));

            const dynamicExam: Exam = {
              id: `dynamic-${subjectId}`,
              examCode: 'Toàn bộ câu hỏi',
              subjectId,
              subjectName: subject?.name || 'Môn học',
              totalQuestions: answers.length,
              answers: answers,
              createdAt: new Date().toISOString(),
            };

            set({ currentExam: dynamicExam });
          }
        } catch (error) {
          console.error('Lỗi khi tải bộ câu hỏi:', error);
          message.error('Lỗi khi tải dữ liệu câu hỏi từ Server');
        } finally {
          set({ loadingQuestions: false });
        }
      },

      fetchSubjects: async (forceRefresh = false) => {
        const { subjects, lastFetchedSubjects } = get();
        const isStale = !lastFetchedSubjects || (Date.now() - lastFetchedSubjects > SUBJECT_CACHE_TTL);

        if (!forceRefresh && subjects.length > 0 && !isStale) {
          console.log('Sử dụng danh sách môn học từ cache');
          return;
        }

        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from('subjects')
            .select('id, name, description, unlock_coin, active')
            .eq('active', 1)
            .order('name', { ascending: true });

          if (error) throw error;

          if (data) {
            const mappedSubjects: Subject[] = data.map((item: { id: string; name: string; description?: string; unlock_coin: string | number; active?: number }) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              unlockCoin: Number(item.unlock_coin) || 0,
              examCount: 1,
              active: item.active || 1,
            }));
            set({ subjects: mappedSubjects, lastFetchedSubjects: Date.now() });
          }
        } catch (error) {
          console.error('Lỗi khi lấy danh sách môn học:', error);
        } finally {
          set({ loading: false });
        }
      },

      getExamBySubject: (subjectId: string) => {
        const currentExam = get().currentExam;
        if (currentExam && currentExam.subjectId === subjectId) {
          return currentExam;
        }
        return undefined;
      },
    }),
    {
      name: 'dhtn-exam-storage',
      partialize: (state) => ({
        unlockedSubjectIds: state.unlockedSubjectIds,
        unlockedDataUrls: state.unlockedDataUrls,
        subjects: state.subjects,
        lastFetchedSubjects: state.lastFetchedSubjects
      }),
    }
  )
);
