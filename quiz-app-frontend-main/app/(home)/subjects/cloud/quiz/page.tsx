"use client";

import { getLastQuizResultForModule, saveQuizResult } from "@/actions/results";
import QuizContent from "@/components/quiz/QuizContent";
import WelcomeCard from "@/components/welcome-quiz/WelcomeCard";
import { useAuth } from "@/context/AuthContext";
import apiRequest from "@/lib/api-client";
import useQuizStore from "@/store/quiz";
import useUserStore from "@/store/user";
import {
  AnyQuestion,
  Difficulty,
  DifficultyLevels,
  EvaluateQuizResponse,
  GenerateQuizResponse,
  QuestionApiResponse,
  QuestionType,
  QuizFeedback,
} from "@/types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getQuizTimeSpent } from "@/lib/quiz-utils";
import { updateUserLevelBasedOnQuizResult } from "@/actions/user";
import { getLowScoringTopics, parseTextResponse } from "@/lib/utils";
import WelcomeCardSE from "@/components/welcome-quiz/WelcomeCardSE";

const QuizPage = () => {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { quizQuestions, quizAnswers, setQuizQuestions, setQuizAnswers, startedAt, setStartedAt, clearStore } = useQuizStore();
  const { userLevel, setUserLevel } = useUserStore();
  const router = useRouter();
  const { user } = useAuth();
  const [selectedModule, setSelectedModule] = useState("");
  const [questionCounts, setQuestionCounts] = useState({ mcq: 15, structured: 5, fillBlanks: 0 });
  const totalQuizCount = 20;

  const [weakTopics, setWeakTopics] = useState<string[]>([]);

  const [isQuestionError, setIsQuestionError] = useState(false);

  const modules = [
    { value: "Introduction and Fundamentals", label: "Introduction and Fundamentals" },
    { value: "Core Services and Infrastructure", label: "Core Services and Infrastructure" },
    { value: "Compute and Storage", label: "Compute and Storage" },
    { value: "Cloud Networking", label: "Cloud Networking" },
    { value: "HADR", label: "HADR" },
    { value: "Security and Monitoring", label: "Security and Monitoring" },
    { value: "Database and Analytics", label: "Database and Analytics" },
    { value: "Cloud Migrations", label: "Cloud Migrations" },
    { value: "Cloud Native Applications", label: "Cloud Native Applications" },
    { value: "Containerization", label: "Containerization" },
  ];

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  useEffect(() => {
    console.log("useEffect triggered - isPageLoaded:", isPageLoaded, "isQuizStarted:", isQuizStarted, "quizQuestions.length:", quizQuestions.length);
    if (isPageLoaded && !isQuizStarted && quizQuestions.length > 0) {
      console.log("Fetching first question...");
      // get first question
      handleGetNextQuiz(0);
    }
  }, [quizQuestions, isPageLoaded, isQuizStarted]);

  const handleStartQuiz = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest<{ message: string }>("/api/cloud/start-quiz/", "POST", {
        user_id: user?.uid,
      });

      console.log("Start quiz response:", res);
      if (res && res.data?.message && res.data.message.includes("started successfully")) {
        const moduleRes = await apiRequest<{ message: string }>("/api/cloud/select-module/", "POST", {
          user_id: user?.uid,
          module_name: selectedModule,
        });
        console.log("Select module response:", moduleRes);
        if (moduleRes && moduleRes.data?.message && (moduleRes.data.message.includes("selected for quiz") || moduleRes.data.message.includes("selected successfully"))) {
          /* Set weak topics */
          const lastQuiz = await getLastQuizResultForModule(user?.uid as string, 1, "cloud", selectedModule);
          let tempWeakTopics: string[] = [];
          //console.log(lastQuiz);
          if (lastQuiz.success && lastQuiz.data && lastQuiz.data.length > 0) {
            const lastQuizData = lastQuiz.data[0];
            const weakTopicsData = lastQuizData.weakTopics ?? [];
            setWeakTopics(weakTopicsData);
            tempWeakTopics = weakTopicsData;
            //console.log("WEAK TOPICS OF LAST QUIZ: ", weakTopicsData);
          }

          /* Generate quiz array */
          let questions: AnyQuestion[] = [];
          Object.keys(questionCounts).forEach((key) => {
            const count = questionCounts[key as keyof typeof questionCounts];
           
            let questionType = key == "mcq" ? QuestionType.MCQ : key == "structured" ? QuestionType.STRUCTURED : QuestionType.FILL_BLANKS;

            for (let i = 0; i < count; i++) {
              let q = {
                id: questions.length + 1,
                answer: "",
                options: [],
                question: "",
                type: questionType,
                explaination: undefined,
                paragraph: undefined,
                topic: "",
              };
              questions.push(q);
            }
          });

          console.log("Generated questions array:", questions);

          setQuizQuestions(questions);
          setStartedAt(new Date().toISOString());

          setIsLoading(false);
        } else {
          setIsLoading(false);
          toast.error("Something went wrong. Could not select the module.");
        }
      } else {
        setIsLoading(false);
        toast.error("Something went wrong. Could not start the quiz.");
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error starting the quiz:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleGetNextQuiz = async (index: number, weakTopicsArray?: string[]) => {
    setIsLoading(true);

    try {
      let questionType = quizQuestions[index].type;

      const res = await apiRequest<any>(
        questionType == QuestionType.MCQ
          ? "/api/cloud/get-next-question/"
          : questionType == QuestionType.STRUCTURED
          ? "/api/cloud/generate-hard-question/"
          : "/api/cloud/generate-fill-in-the-blank/",
        "POST",
        {
          user_id: user?.uid,
          topics: weakTopicsArray && weakTopicsArray.length > 0 ? weakTopicsArray : weakTopics,
          module_name: selectedModule,
        },
        { "Content-Type": "application/json" }
      );

      if (res && res.data && !res.data.detail) {
        
        const question = questionType == QuestionType.MCQ ? (res.data.question_output ? res.data.question_output : res.data) : res.data.output;

        const parsedResponse: QuestionApiResponse = parseTextResponse(question);

        let quistionsList = quizQuestions;
        setIsQuestionError(false);

        // if (quizQuestions.length == 0) {
        //   setStartedAt(new Date().toISOString());
        // }
        // setQuizQuestions([
        //   ...quistionsList,
        //   {
        //     id: quistionsList.length + 1,
        //     answer: parsedResponse.answer,
        //     options: parsedResponse.choices,
        //     question: parsedResponse.question,
        //     type: questionType,
        //     explaination: parsedResponse.explanation,
        //     paragraph: parsedResponse.content,
        //     topic: parsedResponse.topic,
        //   },
        // ]);

        let newQuestions: any[] = [...quizQuestions];
        newQuestions[index] = {
          ...newQuestions[index],
          answer: parsedResponse.answer,
          options: parsedResponse.choices,
          question: parsedResponse.question,
          explaination: parsedResponse.explanation,
          paragraph: parsedResponse.content,
          topic: parsedResponse.topic,
        };
        setIsQuestionError(false);
        setQuizQuestions(newQuestions);

        if (index == 0) {
          setIsQuizStarted(true);
        }

        setIsLoading(false);
      } else {
        setIsQuestionError(true);
        setIsLoading(false);
      }
    } catch (error) {
      setIsQuestionError(true);
      setIsLoading(false);
      console.error("Error starting the quiz:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const retryGetNextQuiz = async (index: number) => {
    setIsLoading(true);

    try {
      let questionType =
        quizQuestions.length >= questionCounts.structured + questionCounts.mcq
          ? QuestionType.STRUCTURED
          : quizQuestions.length >= questionCounts.mcq
          ? QuestionType.STRUCTURED
          : QuestionType.MCQ;

      const res = await apiRequest<any>(
        questionType == QuestionType.MCQ
          ? "/api/cloud/get-next-question/"
          : questionType == QuestionType.STRUCTURED
          ? "/api/cloud/generate-hard-question/"
          : "/api/cloud/generate-fill-in-the-blank/",
        "POST",
        {
          user_id: user?.uid,
          topics: weakTopics,
          module_name: selectedModule,
        },
        { "Content-Type": "application/json" }
      );

      if (res && res.data && !res.data.detail) {
        const question = questionType == QuestionType.MCQ ? (res.data.question_output ? res.data.question_output : res.data) : res.data.output;

        const parsedResponse: QuestionApiResponse = parseTextResponse(question);

        let quistionsList = quizQuestions;

        let newQuestions: AnyQuestion[] = [...quizQuestions];
        newQuestions[index] = {
          id: index + 1,
          answer: parsedResponse.answer,
          options: parsedResponse.choices,
          question: parsedResponse.question,
          type: questionType,
          explaination: parsedResponse.explanation,
          paragraph: parsedResponse.content,
          topic: parsedResponse.topic,
        };
        setIsQuestionError(false);
        setQuizQuestions(newQuestions);
      } else {
        setIsQuestionError(true);
      }
    } catch (error) {
      setIsQuestionError(true);
      console.error("Error starting the quiz:", error);
      toast.error("Something went wrong. Please try again.");
    }
    setIsLoading(false);
  };

  const handleQuizComplete = async (answers: Record<string, string>) => {
    setIsLoading(true);

    try {
      let correctAnswers = [];
      let feedbacks: QuizFeedback[] = [];

      let questions = quizQuestions;

      questions.forEach((q) => {
        if (q.type === QuestionType.STRUCTURED) {
          if (q.isCorrect) {
            correctAnswers.push(answers[q.id]);
          }
        } else if (answers[q.id] && q.answer.charAt(0) === answers[q.id].charAt(0)) {
          q.isCorrect = true;
          correctAnswers.push(answers[q.id]);
        }

        feedbacks.push({
          isCorrect: answers[q.id] !== undefined && q.answer.charAt(0) === answers[q.id].charAt(0),
          feedback: {
            criteria1: "",
            criteria2: "",
            criteria3: "",
          },
          comments: q.explaination ?? "",
        });
      });

      let weakTopics = getLowScoringTopics(questions);

      if (questions.length < totalQuizCount) {
        for (let i = questions.length; i < totalQuizCount; i++) {
          feedbacks.push({
            isCorrect: false,
            feedback: {
              criteria1: "",
              criteria2: "",
              criteria3: "",
            },
            comments: "",
          });
        }
      }

      const completedAt = new Date();

      const newLevel = await updateUserLevelBasedOnQuizResult(user?.uid as string, correctAnswers.length, userLevel as Difficulty);

      if (newLevel && newLevel !== userLevel) {
        setUserLevel(newLevel);
        toast.success(`Your level has been updated to ${newLevel}`);
      }
      if (user?.uid) {
        const savedResult = await saveQuizResult({
          userId: user?.uid,
          score: correctAnswers.length,
          difficulty: userLevel ?? DifficultyLevels.EASY,
          timeSpent: getQuizTimeSpent(startedAt, completedAt.toISOString()),
          completedAt: completedAt.toISOString(),
          startedAt: startedAt,
          answers: answers,
          feedback: feedbacks,
          questions: questions,
          subject: "cloud",
          module: selectedModule,
          weakTopics: weakTopics,
        });

        toast.success("Quiz completed successfully");
        clearStore();
        router.push(`/subjects/cloud/quiz/result?id=${savedResult.id}`);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error completing the quiz:", error);
    }
  };

  const handleSelectModule = (value: any) => {
    setSelectedModule(value);
  };

  const getQuizeTime = () => {
    let time = 0;
    time = questionCounts.mcq * 120 + questionCounts.fillBlanks * 240 + questionCounts.structured * 600;
    return time;
  };

  if (quizQuestions?.length === 0) {
    return (
      <WelcomeCardSE
        modules={modules}
        handleStartQuiz={handleStartQuiz}
        handleSelectModule={handleSelectModule}
        isLoading={isLoading}
        selectedModule={selectedModule}
      />
    );
  }

  return (
    <QuizContent
      questions={quizQuestions}
      answers={quizAnswers}
      setAnswers={setQuizAnswers}
      timeLeft={getQuizeTime()}
      onComplete={handleQuizComplete}
      isLoading={isLoading}
      quizCount={questionCounts}
      getNextQuestion={handleGetNextQuiz}
      setQuestions={setQuizQuestions}
      subject="cloud"
      isQuestionError={isQuestionError}
      retryGetQuestion={retryGetNextQuiz}
      isStarted={isQuizStarted}
      
    />
  );
};

export default QuizPage;
