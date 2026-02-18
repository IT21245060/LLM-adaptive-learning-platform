"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import useUserStore from "@/store/user";
import Image from "next/image";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageLoader from "@/components/shared/loader";
import RecentActivities from "@/components/dashboard/RecentActivities";
import QuizLeaderboard from "@/components/dashboard/QuizLeaderboard";
import toast from "react-hot-toast";
import QuizStats from "@/components/dashboard/QuizStats";
import Link from "next/link";

const DashboardPage = () => {
  const { user } = useAuth();
  const { userLevel, _hasHydrated } = useUserStore();
  const router = useRouter();

  const modules = [
    { id: "cloud", name: "Cloud Computing" },
    { id: "dl", name: "Deep Learning" },
    { id: "dba", name: "Database Administration" },
  ];

  /*   useEffect(() => {
    if (_hasHydrated && !userLevel) {
      const timer = setTimeout(() => {
        toast("Redirecting to welcome quiz...");
        router.push("/welcome-english-quiz");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [userLevel, router, _hasHydrated]); */

  if (!_hasHydrated) {
    return <PageLoader />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#44A673] via-emerald-400 to-teal-300 px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl">Master Every Question with Confidence</h1>
        <p className="mt-6 text-lg text-white/90 drop-shadow">
          We guide you through expert explanations and immersive practice so you're always prepared, whether it's for an exam or a quick quiz.
        </p>
        <p className="mt-2 text-white/80">Get started by choosing a module below.</p>
      </section>

      {/* Module Selection Section */}
      <section className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {modules.map((module) => (
          <Link
            key={module.id}
            href={`/subjects/${module.id}`}
            className="flex flex-col justify-center items-center min-h-[200px] rounded-2xl border-2 border-white/30 bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:bg-white transition-all duration-300 p-12 text-center transform hover:scale-105"
          >
            <h2 className="text-2xl font-semibold text-gray-800">{module.name}</h2>
            <p className="mt-3 text-gray-600">Start practicing now</p>
          </Link>
        ))}
      </section>
    </main>
  );

  /* return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
      <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="col-span-2 p-6">
          <CardHeader>
            <CardTitle>Welcome, {user?.displayName} 👋</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-20">
            <div className="flex flex-col flex-1 gap-8">
              <h1 className="text-4xl font-semibold">
                Learn new concepts for each question
              </h1>
              <p>
                We help you confidently prepare for English exams and quizzes
                with expert guidance and engaging practice.
              </p>
              <Button className="w-fit" onClick={() => router.push("/quiz")}>
                Start Quiz
              </Button>
            </div>
            <Image
              src="/images/dashboard.png"
              alt="Quiz"
              width={1000}
              height={1000}
              className="flex-1 object-cover h-72"
            />
          </CardContent>
        </Card>

        <RecentActivities />
        <QuizStats />
      </div>

      <div className="col-span-2 lg:col-span-1">
        <QuizLeaderboard />
      </div>
    </div>
  ); */
};

export default DashboardPage;
