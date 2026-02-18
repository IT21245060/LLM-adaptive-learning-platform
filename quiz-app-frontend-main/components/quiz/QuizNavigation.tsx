import React, { memo } from "react";
import QuizTimer from "./QuizTimer";
import QuizQuestionButton from "./QuizQuestionButton";
import { AnyQuestion } from "@/types";
import { Button } from "../ui/button";

interface QuestionSectionProps {
  title: string;
  count: number;
  startIndex: number;
  currentQuestion: number;
  setCurrentQuestion: (question: number) => void;
  disableQuestionButtons?: boolean;
  questions: AnyQuestion[];
  answers: Record<string, string>;
  handleStructuredAnswer?: (index: number) => void;
}

const QuestionSection = memo(
  ({
    title,
    count,
    startIndex,
    currentQuestion,
    setCurrentQuestion,
    disableQuestionButtons = false,
    questions,
    answers,
    handleStructuredAnswer,
  }: QuestionSectionProps) => {
    if (count === 0) return null;

    return (
      <>
        <p className="text-sm font-medium text-muted-foreground mb-2 mt-4">{title}</p>
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: count }).map((_, index) => (
            <QuizQuestionButton
              key={index}
              questionNumber={startIndex + index + 1}
              isCurrent={currentQuestion === startIndex + index + 1}
              onClick={() => {
                if (handleStructuredAnswer !== undefined) {
                  handleStructuredAnswer(currentQuestion - 1);
                }
                setCurrentQuestion(startIndex + index);
              }}
              disabled={disableQuestionButtons || questions[startIndex + index] === undefined}
              isAnswered={!!answers[questions[startIndex + index]?.id]}
            />
          ))}
        </div>
      </>
    );
  }
);

QuestionSection.displayName = "QuestionSection";

interface QuizNavigationProps {
  currentQuestion: number;
  setCurrentQuestion: (question: number) => void;
  mcqCount?: number;
  structuredCount?: number;
  fillBlanksCount?: number;
  timeLeft?: number;
  onTimeUp?: () => void;
  disableQuestionButtons?: boolean;
  onComplete?: () => void;
  questions: AnyQuestion[];
  answers: Record<string, string>;
  isReview?: boolean;
  handleStructuredAnswer: (index: number) => void;
}

const QuizNavigation = memo(
  ({
    currentQuestion,
    setCurrentQuestion,
    mcqCount = 0,
    structuredCount = 0,
    fillBlanksCount = 0,
    timeLeft,
    onTimeUp,
    disableQuestionButtons = false,
    onComplete,
    questions,
    answers,
    isReview = false,
    handleStructuredAnswer,
  }: QuizNavigationProps) => {
    return (
      <div className="border rounded-md overflow-hidden">
        <p className="bg-gray-100 font-bold p-4">Quiz Navigation</p>
        <div className=" px-6 py-4">
          <QuestionSection
            title="MCQ"
            count={mcqCount}
            startIndex={0}
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
            disableQuestionButtons={disableQuestionButtons}
            questions={questions}
            answers={answers}
            handleStructuredAnswer={handleStructuredAnswer}
          />

          <QuestionSection
            title="Structured"
            count={structuredCount}
            startIndex={mcqCount}
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
            disableQuestionButtons={disableQuestionButtons}
            questions={questions}
            answers={answers}
            handleStructuredAnswer={handleStructuredAnswer}
          />

          <QuestionSection
            title="Fill Blanks"
            count={fillBlanksCount}
            startIndex={mcqCount + structuredCount}
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
            disableQuestionButtons={disableQuestionButtons}
            questions={questions}
            answers={answers}
            handleStructuredAnswer={handleStructuredAnswer}
          />

          {onComplete && (
            <div className="mt-4">
              <Button 
                variant="link" 
                className="p-0" 
                onClick={() => {
                  if (window.confirm(isReview ? "Are you sure you want to finish review?" : "Are you sure you want to finish the quiz? Unanswered questions will be marked as incorrect.")) {
                    onComplete();
                  }
                }}
              >
                {isReview ? "Finish review" : "Finish attempt..."}
              </Button>
            </div>
          )}

          {timeLeft && onTimeUp && (
            <div className="">
              <QuizTimer duration={timeLeft} onTimeUp={onTimeUp} />
            </div>
          )}
        </div>
      </div>
    );
  }
);

QuizNavigation.displayName = "QuizNavigation";

export default QuizNavigation;
