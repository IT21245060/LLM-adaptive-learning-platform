export * from "./feedback";

export type Difficulty = "Easy" | "Medium" | "Hard";
export enum DifficultyLevels {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard",
}

export enum QuestionType {
  DIFFICULTY = "difficulty",
  MCQ = "mcq",
  FILL_BLANKS = "fill-in-the-blanks",
  STRUCTURED = "structured",
}

type Question = {
  id: number;
  question: string;
  answer: string;
  type: QuestionType;
  topic: string;
  paragraph?: string;
  explaination?: string;
  isCorrect?: boolean;
};

export type DifficultyQuestion = Question & {
  options: string[];
  difficulty: Difficulty;
  type: QuestionType.DIFFICULTY;
};

export type McqQuestion = Question & {
  options: string[];
  type: QuestionType.MCQ;
};

export type FillBlanksQuestion = Question & {
  options: string[];
  type: QuestionType.FILL_BLANKS;
};

export type StructuredQuestion = Question & {
  answer: string;
  type: QuestionType.STRUCTURED;
};

export type AnyQuestion = DifficultyQuestion | McqQuestion | FillBlanksQuestion | StructuredQuestion;

export type DifficultyTestResponse = {
  test_questions: DifficultyQuestion[];
};

export type EvaluateDifficultyTestResponse = {
  difficulty_level: Difficulty;
};

export type GenerateQuizResponse = {
  quiz_questions: [(McqQuestion | FillBlanksQuestion | StructuredQuestion)[], string[]];
};

export type QuizStatsType = {
  averageScore: number;
  totalQuizzes: number;
  totalDuration: number;
  averageDuration: number;
  highestScore: number;
  lowestScore: number;
  totalCorrectAnswers: number;
  averageCorrectAnswers: number;
};

export type QuestionApiResponse = {
  answer: string;
  choices: string[];
  explanation: string;
  question: string;
  topic: string;
  content: string;
};
