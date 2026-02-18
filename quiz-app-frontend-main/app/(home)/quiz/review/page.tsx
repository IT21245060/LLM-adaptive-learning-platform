"use client";

import { getQuizResult } from "@/actions/results";
import { QuizResult } from "@/actions/results";
import QuizContent from "@/components/quiz/QuizContent";
import PageLoader from "@/components/shared/loader";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const ReviewPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchQuizResult = async () => {
      if (user?.uid && id) {
        const result = await getQuizResult(id);

        if (!result.success || !result.data) {
          toast.error(result.error || "Something went wrong");
          return;
        }

        setQuizResult(result?.data || null);
      }
    };
    fetchQuizResult();
  }, [user?.uid, id]);

  if (!quizResult) {
    return <PageLoader />;
  }

  return (
    <QuizContent
      questions={quizResult.questions}
      answers={quizResult.answers}
      feedbacks={quizResult.feedback}
      setAnswers={() => {}}
      onComplete={() => {
        router.back();
      }}
      isReview={true}
      quizCount={{ mcq: 10, structured: 5, fillBlanks: 5 }}
      getNextQuestion={() => {}}
      subject={""}
      isStarted={false}
      retryGetQuestion={()=>{}}
      isQuestionError={false}
    />
  );
};
export default ReviewPage;
