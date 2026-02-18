import { getAverageScore } from "@/actions/results";
import { useAuth } from "@/context/AuthContext";
import useUserStore from "@/store/user";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { QuizStatsType } from "@/types";

const QuizStats = ({ subject }: { subject: string }) => {
  const { user } = useAuth();
  const [quizStats, setQuizStats] = useState<QuizStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userLevel } = useUserStore();

  useEffect(() => {
    const fetchAverageScore = async () => {
      if (!user?.uid || !userLevel) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching quiz stats:", { userId: user.uid, userLevel, subject });
        const res = await getAverageScore(user?.uid, userLevel, subject);
        console.log("Quiz stats response:", res);
        
        if (res.success && res.data) {
          setQuizStats(res.data);
        } else {
          console.error("Failed to fetch quiz statistics:", res.error);
          setError(res.error as string || "Unknown error");
          setQuizStats(null);
        }
      } catch (error) {
        console.error("Error in fetchAverageScore:", error);
        const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred";
        setError(errorMsg);
        setQuizStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAverageScore();
  }, [user?.uid, userLevel, subject]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Stats</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4 text-muted-foreground">Loading statistics...</div>
        ) : error ? (
          <div className="flex justify-center py-4 text-red-500">Error: {error}</div>
        ) : quizStats ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold">{quizStats.averageScore.toFixed(1)}%</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-muted-foreground">Total Quizzes</p>
              <p className="text-2xl font-bold">{quizStats.totalQuizzes}</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-muted-foreground">Average Duration</p>
              <p className="text-2xl font-bold">{Math.round(quizStats.averageDuration / 60000)} min</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-muted-foreground">Total Duration</p>
              <p className="text-2xl font-bold">{Math.round(quizStats.totalDuration / 60000)} min</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-muted-foreground">Highest Score</p>
              <p className="text-2xl font-bold text-green-600">{quizStats.highestScore}%</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-muted-foreground">Lowest Score</p>
              <p className="text-2xl font-bold text-red-600">{quizStats.lowestScore}%</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-muted-foreground">Current Level</p>
              <p className="text-2xl font-bold">{userLevel}</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
              <p className="text-sm text-muted-foreground">Avg. Correct Answers</p>
              <p className="text-2xl font-bold">{quizStats.averageCorrectAnswers.toFixed(1)}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-4 text-muted-foreground">No quiz data available</div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizStats;
