"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import Image from "next/image";
import RecentActivities from "../../../../components/dashboard/RecentActivities";
import QuizStats from "../../../../components/dashboard/QuizStats";
import QuizLeaderboard from "../../../../components/dashboard/QuizLeaderboard";
import { useAuth } from "../../../../context/AuthContext";
import { useRouter } from "next/navigation";

const DatabaseAdministrationModule = () => {
  const { user } = useAuth();
  const router = useRouter();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
      <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="col-span-2 p-6">
          <CardHeader>
            <CardTitle>Welcome, {user?.displayName} 👋</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-20">
            <div className="flex flex-col flex-1 gap-8">
              <div>
                <h1 className="text-4xl font-bold">Database Administration</h1>
                <h2 className="text-2xl font-normal mt-2">Master database management and optimization</h2>
              </div>

              <p>We help you confidently prepare for Database Administration exams and quizzes with expert guidance and engaging practice.</p>
              <Button className="w-fit" onClick={() => router.push("/subjects/dba/quiz")}>
                Start Quiz
              </Button>
            </div>
            <Image src="/images/dashboard.png" alt="Quiz" width={1000} height={1000} className="flex-1 object-cover h-72" />
          </CardContent>
        </Card>

        <RecentActivities subject="dba" />
        <QuizStats subject="dba" />
      </div>

      <div className="col-span-2 lg:col-span-1">
        <QuizLeaderboard subject="dba" />
      </div>
    </div>
  );
};

export default DatabaseAdministrationModule;
