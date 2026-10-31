"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Calendar, 
  AlertCircle, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2,
  FolderOpen
} from "lucide-react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { AddAnnouncementModal } from "@/components/announcements/AddAnnouncementModal";
import { createClient } from "@/lib/supabase/client";
import { Announcement, AnnouncementCategory, AnnouncementPriority } from "@/types/database";
import { filterAnnouncements } from "@/services/announcement.service";
import { calculatePriority } from "@/services/priority.service";
import { ExtractedAnnouncement } from "@/lib/ai/types";

// Explicit fallback campus data for offline / unseeded states (clearly labelled)
const SAMPLE_DEMO_DATA: Announcement[] = [
  {
    id: "demo-1",
    campus_id: "demo-campus",
    created_by: "demo-user",
    title: "[DEMO] GDG Campus Hackathon 2026",
    description: "24-hour campus hackathon solving real-world challenges using Google technologies.",
    original_text: null,
    category: "Hackathon",
    event_date: "2026-11-15",
    event_time: "09:00",
    timezone: "Asia/Kolkata",
    venue: "Innovation Lab, Block C",
    registration_deadline: "2026-11-10T23:59:59Z",
    registration_url: "https://gdg.community.dev/hackathon",
    priority: "urgent",
    status: "published",
    instructions: ["Team of 2-4", "Bring Laptop"],
    missing_fields: [],
    extraction_confidence: 0.98,
    extraction_status: "verified",
    is_verified: true,
    created_at: "2026-11-01T00:00:00.000Z",
    updated_at: "2026-11-01T00:00:00.000Z",
  },
  {
    id: "demo-2",
    campus_id: "demo-campus",
    created_by: "demo-user",
    title: "[DEMO] Annual Tech Symposium 2026",
    description: "Department of Computer Engineering presents project expo, research papers, and workshops.",
    original_text: null,
    category: "Workshop",
    event_date: "2026-11-20",
    event_time: "10:00",
    timezone: "Asia/Kolkata",
    venue: "Main Auditorium",
    registration_deadline: "2026-11-15T23:59:59Z",
    registration_url: "https://example.com/symposium",
    priority: "upcoming",
    status: "published",
    instructions: ["Carry College ID"],
    missing_fields: [],
    extraction_confidence: 0.95,
    extraction_status: "verified",
    is_verified: true,
    created_at: "2026-11-01T00:00:00.000Z",
    updated_at: "2026-11-01T00:00:00.000Z",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<AnnouncementCategory | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<AnnouncementPriority | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const currentDateStr = "Saturday, Oct 31, 2026";

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const supabase = createClient();
      if (!supabase) {
        setAnnouncements(SAMPLE_DEMO_DATA);
        setIsDemoMode(true);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false });

        if (error || !data || data.length === 0) {
          // If unmigrated or empty, offer realistic labelled demo data so UI remains genuinely useful
          setAnnouncements(SAMPLE_DEMO_DATA);
          setIsDemoMode(true);
        } else {
          setAnnouncements(data as Announcement[]);
          setIsDemoMode(false);
        }
      } catch {
        setAnnouncements(SAMPLE_DEMO_DATA);
        setIsDemoMode(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const filtered = filterAnnouncements(announcements, {
    searchQuery,
    category: categoryFilter,
    priority: priorityFilter,
  });

  const totalCount = announcements.length;
  const urgentCount = announcements.filter((a) => a.priority === "urgent").length;
  const upcomingCount = announcements.filter((a) => a.priority === "upcoming").length;
  const todayPriorities = announcements.filter((a) => {
    const p = calculatePriority(a.event_date, a.registration_deadline);
    return p.isUrgentToday;
  });

  const handleSaveAnnouncement = async (item: Partial<ExtractedAnnouncement>) => {
    const priorityCalc = calculatePriority(item.event_date || null, item.registration_deadline || null);

    const newRecord: Announcement = {
      id: `ann-${Date.now()}`,
      campus_id: "default-campus",
      created_by: "current-user",
      title: item.title || "Untitled Announcement",
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
      extraction_confidence: item.extraction_confidence ?? 1.0,
      extraction_status: "manual",
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.from("announcements").insert(newRecord);
      } catch {
        // Fallback to local state if offline
      }
    }

    setAnnouncements((prev) => [newRecord, ...prev]);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardSidebar onOpenCreateModal={() => setIsModalOpen(true)} />

      <main className="flex-1 px-4 py-8 sm:px-8 max-w-7xl mx-auto space-y-8 mt-14 md:mt-0">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Campus Overview
              </h1>
              {isDemoMode && (
                <Badge variant="neutral">Demo Content Mode</Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Current Date: {currentDateStr || "Loading date..."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => setIsModalOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Announcement
            </Button>
          </div>
        </div>

        {/* STATS TILES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <span className="text-xs font-medium text-slate-500">Total Tracked</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalCount}</p>
          </Card>
          <Card>
            <span className="text-xs font-medium text-red-600 dark:text-red-400">Urgent Notices</span>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{urgentCount}</p>
          </Card>
          <Card>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Upcoming Events</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{upcomingCount}</p>
          </Card>
          <Card>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Today&apos;s Priorities</span>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{todayPriorities.length}</p>
          </Card>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, description, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 shadow-sm"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as AnnouncementCategory | "all")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-sm focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Workshop">Workshop</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Placement">Placement</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as AnnouncementPriority | "all")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-sm focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* FEED SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Campus Feed
            </h2>
            <span className="text-xs text-slate-500">Showing {filtered.length} announcements</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-300 rounded-xl bg-white dark:border-slate-800 dark:bg-slate-900/50">
              <FolderOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">No announcements match your search</h3>
              <p className="text-xs text-slate-500 mt-1">Try clearing your filters or add a new announcement.</p>
              <Button onClick={() => setIsModalOpen(true)} size="sm" variant="outline" className="mt-4">
                Add Announcement
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <AnnouncementCard key={item.id} announcement={item} />
              ))}
            </div>
          )}
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
