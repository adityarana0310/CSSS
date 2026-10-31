"use client";

import { useEffect, useState } from "react";
import { Sparkles, Calendar, AlertCircle, RefreshCw } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { Announcement } from "@/types/database";

export default function DigestPage() {
  const [digestContent, setDigestContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const generateDigest = async () => {
    setIsLoading(true);
    setErrorStatus(null);

    try {
      const res = await fetch("/api/digest", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 || data.isQuotaExceeded) {
          setErrorStatus("Gemini API quota has been reached. Displaying structured campus summary instead.");
          setDigestContent(`### Campus Activity Summary (Automated Fallback)
- **Urgent Registration Deadlines**: Review all deadlines marked under 48 hours in the calendar view.
- **Hackathons & Technical Events**: Google Developer Group Hackathon registration is currently approaching.
- **Academic Notices**: Check your student portal for official mid-semester hall tickets.
- **Action Required Today**: Verify any pending project submissions.`);
        } else {
          setErrorStatus(data.error || "Unable to generate AI digest.");
        }
      } else {
        setDigestContent(data.digest);
      }
    } catch (e: unknown) {
      setErrorStatus(e instanceof Error ? e.message : "Error generating digest");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/digest", { method: "POST" });
        const data = await res.json();
        if (!ignore) {
          if (!res.ok) {
            if (res.status === 429 || data.isQuotaExceeded) {
              setErrorStatus("Gemini API quota has been reached. Displaying structured campus summary instead.");
              setDigestContent(`### Campus Activity Summary (Automated Fallback)
- **Urgent Registration Deadlines**: Review all deadlines marked under 48 hours in the calendar view.
- **Hackathons & Technical Events**: Google Developer Group Hackathon registration is currently approaching.
- **Academic Notices**: Check your student portal for official mid-semester hall tickets.
- **Action Required Today**: Verify any pending project submissions.`);
            } else {
              setErrorStatus(data.error || "Unable to generate AI digest.");
            }
          } else {
            setDigestContent(data.digest);
          }
        }
      } catch (e: unknown) {
        if (!ignore) {
          setErrorStatus(e instanceof Error ? e.message : "Error generating digest");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardSidebar />

      <main className="flex-1 px-4 py-8 sm:px-8 max-w-5xl mx-auto space-y-6 mt-14 md:mt-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 mb-2">
              <Sparkles className="h-3 w-3" />
              AI Intelligence Digest
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              What do I need to know this week?
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Concise summary of upcoming events, approaching deadlines, and urgent notices
            </p>
          </div>

          <Button onClick={generateDigest} isLoading={isLoading} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Regenerate Digest
          </Button>
        </div>

        {errorStatus && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{errorStatus}</p>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>This Week&apos;s Campus Pulse</CardTitle>
            <CardDescription>Synthesized directly from active campus database records</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-16 text-center space-y-3">
                <Sparkles className="h-8 w-8 text-indigo-500 animate-pulse mx-auto" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Synthesizing campus announcements...
                </p>
              </div>
            ) : digestContent ? (
              <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                {digestContent}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-8 text-center">
                Click Regenerate Digest to produce an updated summary.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
