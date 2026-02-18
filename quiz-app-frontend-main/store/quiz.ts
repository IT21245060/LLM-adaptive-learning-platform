import { create } from "zustand";
import { AnyQuestion } from "@/types";
import { persist, createJSONStorage } from "zustand/middleware";

type QuizStore = {
  quizAnswers: Record<string, string>;
  quizQuestions: AnyQuestion[];
  startedAt: string;
  setQuizAnswers: (newAnswers: Record<string, string>) => void;
  setQuizQuestions: (newQuestions: AnyQuestion[]) => void;
  setStartedAt: (newStartedAt: string) => void;
  clearStore: () => void;
};

const useQuizStore = create<QuizStore>()(
  persist(
    (set) => ({
      quizAnswers: {} as Record<string, string>,
      quizQuestions: [] as AnyQuestion[],
      startedAt: "",
      setQuizAnswers: (newAnswers: Record<string, string>) =>
        set({ quizAnswers: newAnswers }),
      setQuizQuestions: (newQuestions: AnyQuestion[]) =>
        set({ quizQuestions: newQuestions }),
      clearStore: () =>
        set({
          quizQuestions: [],
          quizAnswers: {},
        }),
      setStartedAt: (newStartedAt: string) => set({ startedAt: newStartedAt }),
    }),
    {
      name: "quiz-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

export default useQuizStore;
