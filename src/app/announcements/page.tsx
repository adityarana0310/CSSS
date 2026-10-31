"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { AddAnnouncementModal } from "@/components/announcements/AddAnnouncementModal";
import { Button } from "@/components/ui/Button";
import { Search, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Announcement } from "@/types/database";
import { filterAnnouncements } from "@/services/announcement.service";
import { ExtractedAnnouncement } from "@/lib/ai/types";
import { calculatePriority } from "@/services/priority.service";

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      if (!supabase) return;
      try {
        const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
        if (data) setAnnouncements(data as Announcement[]);
      } catch {}
    }
    load();
  }, []);

  const filtered = filterAnnouncements(announcements, { searchQuery: search });

  const handleSaveAnnouncement = async (item: Partial<ExtractedAnnouncement>) => {
    const priorityCalc = calculatePriority(item.event_date || null, item.registration_deadline || null);
    const newRecord: Announcement = {
      id: `ann-${Date.now()}`,
      campus_id: "default-campus",
      created_by: "current-user",
      title: item.title || "Untitled",
      description: item.description || "",
      original_text: null,
      category: item.category || "General",
      event_date: item.event_date || null,
      event_time: item.event_time || null,
      timezone: "Asia/Kolkata",
      venue: item.venue || null,
      registration_deadline: item.registration_deadline || null,
      registration_url: item.registration_url || null,
      priority: priorityCalc.priority,
      status: "published",
      instructions: item.instructions || [],
      missing_fields: item.missing_fields || [],
      extraction_confidence: 1.0,
      extraction_status: "manual",
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAnnouncements((prev) => [newRecord, ...prev]);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardSidebar onOpenCreateModal={() => setIsModalOpen(true)} />
      <main className="flex-1 px-4 py-8 sm:px-8 max-w-7xl mx-auto space-y-6 mt-14 md:mt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              All Announcements
            </h1>
            <p className="text-xs text-slate-500 mt-1">Browse, search, and filter all campus updates</p>
          </div>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Announcement
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search all announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      </main>

      <AddAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveAnnouncement={handleSaveAnnouncement}
      />
    </div>
  );
}

