import React, { useEffect, useState } from "react";
import QuizNavigation from "./QuizNavigation";
import QuizQuestion from "./QuizQuestion";
import { AnyQuestion, QuestionType, QuizFeedback } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import PageLoader from "../shared/loader";
import apiRequest from "@/lib/api-client";
import CustomPageLoader from "../shared/customLoader";
import { useRouter } from "next/navigation";
interface QuizContentProps {
  timeLeft?: number;
  onComplete: (answers: Record<string, string>) => void;
  disableQuestionButtons?: boolean;
  isReview?: boolean;
  questions: AnyQuestion[];
  answers: Record<string, string>;
  setAnswers?: (answers: Record<string, string>) => void;
  isLoading?: boolean;
  feedbacks?: QuizFeedback[];
  quizCount: { mcq: number; structured: number; fillBlanks: number };
  getNextQuestion: (index: number, weakTopics?: string[]) => void;
  setQuestions?: (newQuestions: AnyQuestion[]) => void;
  subject: string;
  isQuestionError: boolean;
  retryGetQuestion: (index: number) => void;
  isStarted: boolean;
}

const QuizContent: React.FC<QuizContentProps> = ({
  timeLeft,
  onComplete,
  disableQuestionButtons = false,
  isReview = false,
  questions,
  answers,
  setAnswers,
  isLoading,
  feedbacks,
  quizCount,
  getNextQuestion,
  setQuestions,
  subject,
  isQuestionError,
  retryGetQuestion,
  isStarted,
}) => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [count, setCount] = useState(quizCount);
  const [totalCount, setTotalCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<AnyQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  useEffect(() => {
    const totalQuizCount = count.mcq + count.fillBlanks + count.structured;
    setTotalCount(totalQuizCount);
  }, [count]);

  const handleOptionSelect = (optionId: string) => {
    if (setAnswers) {
      setAnswers({
        ...answers,
        [questions[currentQuestionIndex].id]: optionId,
      });
    }
  };

  useEffect(() => {
    //console.log("Is Loading: ", isLoading);
    if (!isReview && isStarted && questions[currentQuestionIndex].question === "") {
      getNextQuestion(currentQuestionIndex);
    }
  }, [currentQuestionIndex]);

  const handleStructuredAnswer = async (currentIndex: number) => {
    // validate answer for structured question

    if (isReview) {
      return;
    }

    try {
      if (questions[currentIndex].type !== QuestionType.STRUCTURED) {
        return;
      }
      //console.log(questions[currentIndex]);
      setLoadingQuestion(true);
      const questionId = questions[currentIndex].id;
      const answer = answers[questionId];

      const res = await apiRequest<any>(
        subject == "english"
          ? "/api/english/validate-hard-answer/"
          : subject == "maths"
          ? "/api/maths/validate-hard-answer/"
          : subject == "cloud"
          ? "/api/cloud/validate-hard-answer/"
          : "/api/se/validate-hard-answer/",
        "POST",
        {
          user_answer: answer ?? "",
        },
        { "Content-Type": "application/json" }
      );

      if (res && res.data && res.data.result) {
       // console.log("Structured Answer Validate: ", res.data);
        if (setQuestions) {
          let newQuestions = [...questions];
          newQuestions[currentIndex].isCorrect = res.data.result === "Correct";
          setQuestions(newQuestions);
        }
      }
      setLoadingQuestion(false);
    } catch (error) {
      setLoadingQuestion(false);
    }
  };

  const handleNext = async () => {
    if (isReview && currentQuestionIndex === totalCount - 1) {
      router.back();
      return;
    }

    if (questions[currentQuestionIndex + 1].question !== "") {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }
    if (questions[currentQuestionIndex].question !== "" && questions[currentQuestionIndex].type === QuestionType.STRUCTURED) {
      await handleStructuredAnswer(currentQuestionIndex);
    }

    if (questions.length < totalCount) {
      getNextQuestion(currentQuestionIndex + 1);
    }

    if (currentQuestionIndex + 1 < totalCount) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      //console.log(answers);
      onComplete(answers);
    }
  };

  const handlePrevious = async () => {
    if (currentQuestionIndex > 0) {
      if (isReview) {
        setCurrentQuestionIndex((prev) => prev - 1);
        return;
      }

      if (questions[currentQuestionIndex - 1].question !== "") {
        setCurrentQuestionIndex((prev) => prev - 1);
        return;
      }

      if (questions[currentQuestionIndex].question !== "" && questions[currentQuestionIndex].type === QuestionType.STRUCTURED) {
        await handleStructuredAnswer(currentQuestionIndex);
      }

      getNextQuestion(currentQuestionIndex - 1);
    }
  };

  useEffect(() => {
    setCount(quizCount);
  }, [questions]);

  return (
    <div className="flex gap-6 bg-white rounded-md p-6 shadow-md overflow-hidden">
      <QuizNavigation
        currentQuestion={currentQuestionIndex + 1}
        setCurrentQuestion={setCurrentQuestionIndex}
        mcqCount={count.mcq}
        structuredCount={count.structured}
        fillBlanksCount={count.fillBlanks}
        timeLeft={timeLeft}
        onTimeUp={handleNext}
        disableQuestionButtons={disableQuestionButtons}
        onComplete={async () => {
          if (isReview) {
            router.back();
          } else {
            // Validate current structured question if not yet validated
            if (questions[currentQuestionIndex].question !== "" && 
                questions[currentQuestionIndex].type === QuestionType.STRUCTURED &&
                questions[currentQuestionIndex].isCorrect === undefined) {
              await handleStructuredAnswer(currentQuestionIndex);
            }
            onComplete(answers);
          }
        }}
        questions={questions}
        answers={answers}
        isReview={isReview}
        handleStructuredAnswer={handleStructuredAnswer}
      />

      <div className="flex-1  rounded-md border">
        <div className=" p-4 bg-gray-100">
          <h3 className="font-bold text-lg">
            Topic : <span className="font-normal">{questions[currentQuestionIndex]?.topic ?? ""}</span>
          </h3>
        </div>
        <div className="px-6 py-8">
          {!isLoading ? (
            isQuestionError ? (
              <div className="flex flex-col justify-center items-center gap-5">
                <p className="text-red-500 text-base">Could not generate the question. Please try again.</p>
                <Button onClick={() => retryGetQuestion(currentQuestionIndex)}>Try Again</Button>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl">
                {questions[currentQuestionIndex].question !== "" && (
                  <QuizQuestion
                    question={questions[currentQuestionIndex]}
                    selectedOption={answers[questions[currentQuestionIndex].id]}
                    onOptionSelect={handleOptionSelect}
                    isReview={isReview}
                    feedback={feedbacks?.[currentQuestionIndex]}
                  />
                )}

                {questions[currentQuestionIndex].question === "" && isReview && (
                  <div className="text-red-500 text-base text-center py-20">This question is unavailable.</div>
                )}

                <div className="mt-8 flex justify-between">
                  <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                    <ChevronsLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <Button onClick={handleNext} disabled={!isReview && loadingQuestion}>
                    {currentQuestionIndex === totalCount - 1 ? "Finish" : "Next"}
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          ) : (
            <CustomPageLoader />
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizContent;
