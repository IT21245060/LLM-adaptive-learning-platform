"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getQuizResult } from "@/actions/results";
import { QuizResult } from "@/actions/results";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import PageLoader from "@/components/shared/loader";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { getQuizGrade, getQuizMarks } from "@/lib/quiz-utils";
import { Button } from "@/components/ui/button";
import ShareResultsModal from "@/components/modals/ShareResultsModal";
import WeakTopics from "@/components/quiz/WeakTopics";

const QuizResultPage = () => {
  const router = useRouter();
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [tableData, setTableData] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [weakTopics, setWeakTopics] = useState<string[]>([]);

  useEffect(() => {
    const fetchQuizResult = async () => {
      if (id) {
        const result = await getQuizResult(id);

        if (!result.success || !result.data) {
          toast.error(result.error || "Something went wrong");
          return;
        }

        const data = result.data;
        setQuizResult(data);
        setTableData([
          { label: "Status", value: "Finished" },
          {
            label: "Started",
            value: data?.startedAt ? format(data?.startedAt, "EEEE, d MMMM yyyy, h.mm a") : "--",
          },
          {
            label: "Completed",
            value: data?.completedAt ? format(data?.completedAt, "EEEE, d MMMM yyyy, h.mm a") : "--",
          },
          { label: "Duration", value: data?.timeSpent.toString() || "0" },
          { label: "Marks", value: getQuizMarks(data?.feedback || []) },
          { label: "Grade", value: getQuizGrade(data?.feedback || []) },
          { label: "Difficulty", value: data?.difficulty },
        ]);
        setWeakTopics(result.data.weakTopics);
      }
    };
    fetchQuizResult();
  }, [id]);

  if (!quizResult) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-2xl p-12">
        <CardHeader>
          <CardTitle className="text-center text-4xl font-medium">Quiz Result</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mx-auto max-w-lg">
            <div className="bg-background overflow-hidden rounded-md border">
              <Table>
                <TableBody>
                  {tableData.map((item) => (
                    <TableRow key={item.label} className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
                      <TableCell className="bg-muted/50 py-2 font-medium text-right">{item.label}</TableCell>
                      <TableCell className="py-2 bg-white">{item.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {weakTopics && <WeakTopics topics={weakTopics} />}
            {quizResult.userId === user?.uid && (
              <div className="flex justify-center items-center mt-8 gap-4 w-sm mx-auto">
                <Button variant="secondary" className="flex-1" onClick={() => router.push(`/subjects/cloud/quiz/review?id=${id}`)}>
                  Review Answers
                </Button>
                <ShareResultsModal />
                <Button className="flex-1" onClick={() => router.push("/subjects/cloud")}>
                  Dashboard
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResultPage;
