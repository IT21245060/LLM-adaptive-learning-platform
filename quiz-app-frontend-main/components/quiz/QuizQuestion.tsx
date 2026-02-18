import React from "react";
import QuizOption from "./QuizOption";
import { AnyQuestion, QuestionType, QuizFeedback } from "@/types";
import { RadioGroup } from "@/components/ui/radio-group";
import { Textarea } from "../ui/textarea";
import { getOptionIndexByValue } from "@/lib/quiz";

interface QuizQuestionProps {
  question: AnyQuestion;
  selectedOption?: string;
  onOptionSelect: (optionId: string) => void;
  isReview?: boolean;
  feedback?: QuizFeedback;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, selectedOption, onOptionSelect, isReview, feedback }) => {
  return (
    <div className="space-y-6">
      {question?.paragraph && <p className="border rounded-md p-2 text-sm">{question.paragraph}</p>}
      <h3 className="text">
        {question.id}. {question.question?.replaceAll("<blank>", "______")}
      </h3>

      {question.type === QuestionType.MCQ || question.type === QuestionType.DIFFICULTY || question.type === QuestionType.FILL_BLANKS ? (
        <RadioGroup
          value={selectedOption ?? ""}
          onValueChange={(value) => {
            onOptionSelect(value);
          }}
        >
          {question.options.map((option, i) => {
            const isCorrect = isReview && (getOptionIndexByValue(question.answer) === i || question.answer === option);
            const isIncorrect = isReview && selectedOption === option && (getOptionIndexByValue(question.answer) !== i || question.answer !== option);
            const isSelected = selectedOption === option;

            return (
              <QuizOption
                key={`${question.id}-${i}`}
                option={option}
                isSelected={isSelected}
                isReview={isReview}
                isCorrect={isCorrect}
                isIncorrect={isIncorrect}
              />
            );
          })}
        </RadioGroup>
      ) : (
        <Textarea
          id={`${question.id}-answer`}
          placeholder="Enter your answer"
          value={selectedOption || ""}
          onChange={(e) => onOptionSelect(e.target.value)}
        />
      )}
      {feedback && (
        <div className="mt-12 space-y-2 bg-gray-100 p-4 rounded-md">
          {feedback.isCorrect ? (
            <p className="text-sm font-bold text-green-500">Your answer is correct</p>
          ) : (
            <p className="text-sm font-bold text-red-500">Your answer is incorrect</p>
          )}
          <p className="text-sm font-bold">Comments</p>
          <p className="text-sm text-gray-500">{feedback.comments}</p>
        </div>
      )}
    </div>
  );
};

export default QuizQuestion;
