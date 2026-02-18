"use client";
import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import CustomSelect from "../ui/select";
import CustomPageLoader from "../shared/customLoader";

const WelcomeCardMaths = ({
  handleStartQuiz,
  handleSelectModule,
  modules,
  selectedModule,
  isLoading,
  numberOfQuestions = 20,
  includesList = ["Multiple Choice Question Section", "Structured Questions Section"],
}: {
  modules: { value: string; label: string }[];
  selectedModule: string;
  numberOfQuestions?: number;
  includesList?: string[];
  handleStartQuiz: () => void;
  isLoading?: boolean;
  handleSelectModule: (value: any) => void;
}) => {
  const [error, setError] = useState("");
  return (
    <Card className="w-4/5 mx-auto my-20">
      {isLoading && <CustomPageLoader />}
      <CardContent className="flex flex-col gap-8 p-6 px-24 justify-center content-center">
        <h1 className="text-center text-3xl font-semibold">Welcome to Your Maths Level Assessment</h1>
        <p>
          Welcome! You are about to begin a {numberOfQuestions}-question quiz designed to evaluate and assess your mathematical proficiency. This quiz
          will help determine your understanding of various mathematical concepts, including arithmetic, algebra, geometry, problem-solving, and
          logical reasoning.
        </p>
        <p>
          Carefully read the instructions before starting the quiz, as it will test your ability to analyze, interpret, and apply mathematical
          knowledge in a variety of contexts. The quiz includes:
        </p>
        <ul className="list-disc mx-auto font-semibold">
          {includesList.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div>
          <h3 className="text-center font-semibold text-md mb-2">Please select a module for the quiz</h3>
          <div className="flex justify-center">
            <CustomSelect
              placeholder="Select a module"
              items={modules}
              onChange={(val: string) => {
                handleSelectModule(val);
                setError("");
              }}
              error={error}
            />
          </div>
        </div>

        <Button
          className="w-32 mx-auto"
          onClick={() => {
            if (selectedModule !== "") {
              setError("");
              handleStartQuiz();
            } else {
              setError("Please select a module.");
            }
          }}
          disabled={isLoading}
        >
          Start Quiz
        </Button>
      </CardContent>
    </Card>
  );
};

export default WelcomeCardMaths;
