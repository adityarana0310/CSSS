"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Bell, Shield, User } from "lucide-react";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderDays, setReminderDays] = useState(3);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardSidebar />
      <main className="flex-1 px-4 py-8 sm:px-8 max-w-4xl mx-auto space-y-6 mt-14 md:mt-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Account & Notification Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your campus preferences, notification windows, and account security
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-500" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure when and how Campus Pulse alerts you about registration deadlines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Send email digests for approaching deadlines
                </span>
              </label>

              <div className="pt-2">
                <Input
                  label="Deadline Alert Window (Days Before)"
                  type="number"
                  min={1}
                  max={14}
                  value={reminderDays}
                  onChange={(e) => setReminderDays(parseInt(e.target.value, 10))}
                  helperText="You will be notified this many days prior to a registration cutoff"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-500" />
                Campus Scope & Security
              </CardTitle>
              <CardDescription>Institutions currently linked to your identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    MIT Academy of Engineering
                  </p>
                  <p className="text-xs text-slate-500">Domain: mitaoe.ac.in</p>
                </div>
                <Badge variant="verified">Enrolled</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="submit">
              {saved ? "Preferences Saved!" : "Save Changes"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

