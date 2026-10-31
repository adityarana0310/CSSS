import { Calendar, Clock, MapPin, Link as LinkIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { Announcement } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface AnnouncementCardProps {
  announcement: Announcement;
  onSelect?: (announcement: Announcement) => void;
}

export function AnnouncementCard({ announcement, onSelect }: AnnouncementCardProps) {
  const isUrgent = announcement.priority === "urgent";
  const isExpired = announcement.priority === "expired";

  return (
    <Card 
      onClick={() => onSelect && onSelect(announcement)}
      className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={announcement.priority}>{announcement.priority.toUpperCase()}</Badge>
          <div className="flex items-center gap-1.5">
            <Badge variant="category">{announcement.category}</Badge>
            {announcement.is_verified && (
              <Badge variant="verified">Verified</Badge>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 line-clamp-1">
          {announcement.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {announcement.description || "No description provided."}
        </p>

        {/* Venue */}
        {announcement.venue && (
          <div className="mt-2.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{announcement.venue}</span>
          </div>
        )}
      </div>

      {/* Date & Deadline Strip */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5 text-xs">
        {announcement.event_date && (
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="h-3.5 w-3.5 text-indigo-500" />
              Event: {announcement.event_date}
            </span>
            {announcement.event_time && (
              <span className="text-slate-400">{announcement.event_time}</span>
            )}
          </div>
        )}

        {announcement.registration_deadline && (
          <div className="flex items-center justify-between font-medium">
            <span className="text-slate-500">Reg Closes:</span>
            <span className={isUrgent ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-300"}>
              {announcement.registration_deadline.split("T")[0]}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

