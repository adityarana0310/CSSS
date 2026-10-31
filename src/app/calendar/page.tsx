"use client";

import { useEffect, useState } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Announcement } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

export default function CalendarPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("November 2026");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      if (!supabase) return;

      try {
        const { data } = await supabase.from("announcements").select("*");
        if (data && data.length > 0) {
          setAnnouncements(data as Announcement[]);
        }
      } catch {}
    }
    load();
  }, []);

  const scheduledEvents = announcements.filter((a) => a.event_date);
  const deadlineEvents = announcements.filter((a) => a.registration_deadline);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardSidebar />

      <main className="flex-1 px-4 py-8 sm:px-8 max-w-7xl mx-auto space-y-6 mt-14 md:mt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Campus Calendar & Deadlines
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Events and registration deadlines mapped side-by-side
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="category">{selectedMonth}</Badge>
          </div>
        </div>

        {/* Schedule List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Event Dates */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-indigo-500" />
              Scheduled Events
            </h2>

            {scheduledEvents.length === 0 ? (
              <Card className="text-center py-12 text-xs text-slate-500">
                No scheduled event dates found.
              </Card>
            ) : (
              scheduledEvents.map((item) => (
                <Card key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {item.event_date} {item.event_time ? `@ ${item.event_time}` : ""}
                    </span>
                    <Badge variant={item.priority}>{item.priority}</Badge>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{item.title}</h3>
                  {item.venue && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {item.venue}
                    </p>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Column 2: Registration Deadlines */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-500" />
              Registration Deadlines
            </h2>

            {deadlineEvents.length === 0 ? (
              <Card className="text-center py-12 text-xs text-slate-500">
                No active registration deadlines found.
              </Card>
            ) : (
              deadlineEvents.map((item) => (
                <Card key={item.id} className="space-y-2 border-l-4 border-l-red-500">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                      Closes: {item.registration_deadline?.split("T")[0]}
                    </span>
                    <Badge variant="category">{item.category}</Badge>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{item.title}</h3>
                  {item.registration_url && (
                    <a
                      href={item.registration_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 hover:underline block truncate"
                    >
                      {item.registration_url}
                    </a>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

