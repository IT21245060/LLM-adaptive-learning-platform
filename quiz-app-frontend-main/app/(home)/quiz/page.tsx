"use client";

import { saveQuizResult } from "@/actions/results";
import QuizContent from "@/components/quiz/QuizContent";
import WelcomeCard from "@/components/welcome-quiz/WelcomeCard";
import { useAuth } from "@/context/AuthContext";
import apiRequest from "@/lib/api-client";
import useQuizStore from "@/store/quiz";
import useUserStore from "@/store/user";
import {
  Difficulty,
  EvaluateQuizResponse,
  GenerateQuizResponse,
  QuestionType,
} from "@/types";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { getQuizTimeSpent } from "@/lib/quiz-utils";
import { updateUserLevelBasedOnQuizResult } from "@/actions/user";

const QuizPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    quizQuestions,
    quizAnswers,
    setQuizQuestions,
    setQuizAnswers,
    startedAt,
    setStartedAt,
    clearStore,
  } = useQuizStore();
  const { userLevel, setUserLevel } = useUserStore();
  const router = useRouter();
  const { user } = useAuth();

  const handleStartQuiz = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest<GenerateQuizResponse>(
        "/api/english/generate-quiz",
        "POST",
        {
          difficulty_level: userLevel,
        }
      );

      const questions = res.data.quiz_questions[0];

      const orderedQuestions = [
        ...questions.filter((q) => q.type === QuestionType.MCQ),
        ...questions.filter((q) => q.type === QuestionType.STRUCTURED),
        ...questions.filter((q) => q.type === QuestionType.FILL_BLANKS),
      ];

      setQuizQuestions(
        orderedQuestions?.map((question, i) => ({
          ...question,
          id: i,
        }))
      );
      setStartedAt(new Date().toISOString());
    } catch (error) {
      console.error("Error starting the quiz:", error);
      toast.error("Something went wrong. Please try again.");
      setQuizQuestions([]);
    }
    setIsLoading(false);
  };

  const handleQuizComplete = async (answers: Record<string, string>) => {
    setIsLoading(true);
    const answersArray = Array.from(
      { length: 20 },
      (_, i) => answers[i] || "<no answer provided>"
    );

    try {
      const completedAt = new Date();

      const res = await apiRequest<EvaluateQuizResponse>(
        "/api/english/evaluate-quiz",
        "POST",
        {
          questions: quizQuestions,
          answers: answersArray,
        }
      );

      const evaluations = res.data?.feedback;
      const correctAnswers = evaluations.filter((e) => e.isCorrect);

      const newLevel = await updateUserLevelBasedOnQuizResult(
        user?.uid as string,
        correctAnswers.length,
        userLevel as Difficulty
      );

      if (newLevel && newLevel !== userLevel) {
        setUserLevel(newLevel);
        toast.success(`Your level has been updated to ${newLevel}`);
      }

      if (user?.uid && userLevel) {
        const savedResult = await saveQuizResult({
          userId: user?.uid,
          score: correctAnswers.length,
          difficulty: userLevel,
          timeSpent: getQuizTimeSpent(startedAt, completedAt.toISOString()),
          completedAt: completedAt.toISOString(),
          startedAt: startedAt,
          answers: answers,
          feedback: evaluations,
          questions: quizQuestions,
          subject: "english",
          module: '',
          weakTopics: [],
        });

        toast.success("Quiz completed successfully");
        clearStore();
        router.push(`/quiz/result?id=${savedResult.id}`);
      }
    } catch (error) {
      console.error("Error completing the quiz:", error);
    }
    setIsLoading(false);
  };

  if (quizQuestions?.length === 0) {
    return (
      <WelcomeCard modules={[]} handleStartQuiz={handleStartQuiz} isLoading={isLoading} handleSelectModule={()=>{}} selectedModule={''}/>
    );
  }

  return (
    <QuizContent
      questions={quizQuestions}
      answers={quizAnswers}
      setAnswers={setQuizAnswers}
      timeLeft={quizQuestions.length * 120}
      onComplete={handleQuizComplete}
      isLoading={isLoading}
      quizCount={{'mcq': 0, 'fillBlanks': 0, 'structured': 0}}
      getNextQuestion={() => {}}
      setQuestions={setQuizQuestions}
      subject="english"
      isQuestionError={false}
      retryGetQuestion={()=>{}}
      isStarted={false}
    />
  );
};

export default QuizPage;
