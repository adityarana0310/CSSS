"use client";

import { useState } from "react";
import { 
  Sparkles, 
  X, 
  AlertCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Link as LinkIcon, 
  Check, 
  Edit3,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ExtractedAnnouncement } from "@/lib/ai/types";
import { AnnouncementCategory } from "@/types/database";

interface AddAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAnnouncement: (announcement: Partial<ExtractedAnnouncement>) => Promise<void>;
}

export function AddAnnouncementModal({
  isOpen,
  onClose,
  onSaveAnnouncement,
}: AddAnnouncementModalProps) {
  const [mode, setMode] = useState<"smart" | "manual">("smart");
  const [unstructuredText, setUnstructuredText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AnnouncementCategory>("General");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [instructionsText, setInstructionsText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleAIExtract = async () => {
    if (!unstructuredText.trim()) return;
    setIsExtracting(true);
    setExtractionError(null);
    setIsQuotaExceeded(false);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: unstructuredText }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 || data.isQuotaExceeded) {
          setIsQuotaExceeded(true);
          setExtractionError(data.error || "Gemini quota exceeded. Please use manual entry.");
        } else {
          setExtractionError(data.error || "Failed to extract announcements.");
        }
        return;
      }

      if (data.announcements && data.announcements.length > 0) {
        const first = data.announcements[0];
        setTitle(first.title || "");
        setDescription(first.description || "");
        setCategory(first.category || "General");
        setEventDate(first.event_date || "");
        setEventTime(first.event_time || "");
        setVenue(first.venue || "");
        setRegistrationDeadline(first.registration_deadline || "");
        setRegistrationUrl(first.registration_url || "");
        setInstructionsText(first.instructions?.join("\n") || "");
        setMode("manual"); // Switch to review & edit form
      }
    } catch (err: unknown) {
      setExtractionError(err instanceof Error ? err.message : "Network error during AI extraction");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSaving(true);
    try {
      const instructions = instructionsText
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await onSaveAnnouncement({
        title,
        description,
        category,
        event_date: eventDate || null,
        event_time: eventTime || null,
        venue: venue || null,
        registration_deadline: registrationDeadline || null,
        registration_url: registrationUrl || null,
        instructions,
        timezone: "Asia/Kolkata",
      });

      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Add Campus Announcement
            </h3>
            <p className="text-xs text-slate-500">
              AI-assisted paste or direct manual creation
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-100 px-5 pt-3 dark:border-slate-800 gap-4">
          <button
            type="button"
            onClick={() => setMode("smart")}
            className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              mode === "smart"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Smart AI Extract
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`flex items-center gap-2 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              mode === "manual"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Edit3 className="h-4 w-4" />
            Manual Entry / Review
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {mode === "smart" ? (
            <div className="space-y-4">
              {extractionError && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{extractionError}</span>
                  </div>
                  {isQuotaExceeded && (
                    <p>
                      You can click below to switch immediately to manual entry. No information will be lost.
                    </p>
                  )}
                  {isQuotaExceeded && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setMode("manual")}
                      className="mt-2 bg-white text-xs border-amber-300 text-amber-900 hover:bg-amber-100"
                    >
                      Proceed to Manual Form
                    </Button>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Paste Unstructured Text (WhatsApp Forward, Email, Poster description)
                </label>
                <textarea
                  rows={8}
                  value={unstructuredText}
                  onChange={(e) => setUnstructuredText(e.target.value)}
                  placeholder="e.g. 📢 Hackathon Alert! Google Developer Group is organising an annual hackathon on 15th Nov 2026. Register by 10th Nov at https://... Venue: Innovation Lab"
                  className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAIExtract}
                  isLoading={isExtracting}
                  disabled={!unstructuredText.trim()}
                >
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Extract Details with AI
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Announcement Title *"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. GDG Campus Hackathon 2026"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AnnouncementCategory)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Placement">Placement</option>
                    <option value="Administrative">Administrative</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <Input
                  label="Venue / Location"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Auditorium Block A / Online"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30 space-y-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Dates & Deadlines (Strictly Separate)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Event Date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    helperText="When the event actually takes place"
                  />
                  <Input
                    label="Registration Deadline"
                    type="date"
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                    helperText="Last date to register"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Event Time"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
                <Input
                  label="Registration URL"
                  type="url"
                  value={registrationUrl}
                  onChange={(e) => setRegistrationUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of the announcement..."
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Important Instructions (one per line)
                </label>
                <textarea
                  rows={2}
                  value={instructionsText}
                  onChange={(e) => setInstructionsText(e.target.value)}
                  placeholder="Bring College ID&#10;Carry Laptop and Charger"
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button variant="ghost" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  Save Announcement
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

