"use client";

import { saveUserLevel } from "@/actions/user";
import AssignedLevelModal from "@/components/modals/AssignedLevelModal";
import QuizContent from "@/components/quiz/QuizContent";
import WelcomeCard from "@/components/welcome-quiz/WelcomeCard";
import { useAuth } from "@/context/AuthContext";
import apiRequest from "@/lib/api-client";
import useQuizStore from "@/store/quiz";
import useUserStore from "@/store/user";
import {
  DifficultyTestResponse,
  EvaluateDifficultyTestResponse,
  QuestionType,
} from "@/types";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

const WelcomeEnglishQuizPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userLevel, setUserLevel } = useUserStore();
  const router = useRouter();
  const { user } = useAuth();
  const {
    quizQuestions,
    quizAnswers,
    setQuizAnswers,
    setQuizQuestions,
    clearStore,
  } = useQuizStore();

  const handleStartQuiz = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest<DifficultyTestResponse>(
        "/api/english/get-difficulty-test"
      );

      setQuizQuestions(
        res.data.test_questions.map((question, i) => ({
          ...question,
          id: i,
          type: QuestionType.DIFFICULTY,
        }))
      );
    } catch (error) {
      console.error("Error starting the quiz:", error);
      toast.error("Something went wrong. Please try again.");
      setQuizQuestions([]);
    }
    setIsLoading(false);
  };

  const handleQuizComplete = async (answers: Record<string, string>) => {
    try {
      const res = await apiRequest<EvaluateDifficultyTestResponse>(
        "/api/english/evaluate-difficulty-test",
        "POST",
        { answers }
      );

      setUserLevel(res.data.difficulty_level);
      await saveUserLevel(user?.uid as string, res.data.difficulty_level);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error starting the quiz:", error);
    }

    clearStore();
  };

  if (quizQuestions?.length === 0) {
    return (
      <div>
        <WelcomeCard
          numberOfQuestions={6}
          modules={[]}
          includesList={["Multiple Choice Question Section (15 Questions)"]}
          handleStartQuiz={handleStartQuiz}
          isLoading={isLoading}
          handleSelectModule={()=>{}} selectedModule={''}
        />
        <AssignedLevelModal
          level={userLevel || ""}
          isOpen={isModalOpen}
          handleClose={() => {
            setIsModalOpen(false);
            router.push("/dashboard");
          }}
        />
      </div>
    );
  }

  return (
    <QuizContent
      questions={quizQuestions}
      answers={quizAnswers}
      setAnswers={setQuizAnswers}
      timeLeft={300}
      onComplete={handleQuizComplete}
      disableQuestionButtons={true}
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

export default WelcomeEnglishQuizPage;
