import Link from "next/link";
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Filter, 
  Search, 
  ShieldAlert, 
  Layers,
  FileText
} from "lucide-react";
import { Navbar, Footer } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50/80 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Campus Intelligence Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 max-w-4xl mx-auto leading-tight sm:leading-tight">
            Your Campus. <span className="text-indigo-600 dark:text-indigo-400">One Pulse.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Never miss an important campus announcement again. Bring events, registration deadlines, hackathons, and examination notices together into one organised, actionable workspace.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <a href="#preview">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Dashboard Preview
              </Button>
            </a>
          </div>

          {/* PRODUCT DASHBOARD PREVIEW */}
          <div id="preview" className="mt-16 text-left max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Illustrative Product Preview</span>
                    <Badge variant="category">Demo Feed</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">Campus Hub Overview</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/dashboard">
                    <Button size="sm" variant="outline">Open Interactive Workspace</Button>
                  </Link>
                </div>
              </div>

              {/* STATS STRIP */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 dark:border-slate-800">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3.5">
                  <span className="text-xs text-slate-500 font-medium">Total Tracked</span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">18</p>
                </div>
                <div className="rounded-lg bg-red-50/60 dark:bg-red-950/30 p-3.5">
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">Urgent Deadlines</span>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">3</p>
                </div>
                <div className="rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Upcoming Events</span>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">11</p>
                </div>
                <div className="rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 p-3.5">
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Deadlines Today</span>
                  <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">1</p>
                </div>
              </div>

              {/* PREVIEW CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {/* Sample Card 1 */}
                <div className="rounded-xl border border-slate-200 p-4 hover:border-indigo-300 transition-all dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <Badge variant="urgent">Registration Closes in 48h</Badge>
                    <span className="text-xs text-slate-400">Hackathon</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mt-2">
                    Google Developer Group Hackathon 2026
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    24-hour campus hackathon solving real-world challenges. Teams of 2-4 members with mentorship.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Nov 15, 2026
                    </span>
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      Reg Deadline: Nov 10
                    </span>
                  </div>
                </div>

                {/* Sample Card 2 */}
                <div className="rounded-xl border border-slate-200 p-4 hover:border-indigo-300 transition-all dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <Badge variant="upcoming">Upcoming Event</Badge>
                    <span className="text-xs text-slate-400">Placement</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mt-2">
                    Campus Placement Drive: Cloud Engineering
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    Tier-1 technical hiring drive for 2027 graduating batch. Eligibility: BE/B.Tech CS/IT with min 7.0 CGPA.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Nov 22, 2026
                    </span>
                    <span className="text-slate-500">Venue: Placement Cell</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="py-20 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Engineered for Clarity and Action
              </h2>
              <p className="mt-3 text-slate-600 dark:text-slate-400">
                Stop sifting through crowded WhatsApp group chats and lost email threads.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                  <Sparkles className="h-5 w-5" />
                </div>
                <CardTitle>Smart AI Announcement Extraction</CardTitle>
                <CardDescription className="mt-2">
                  Paste raw WhatsApp forwards, email notices, or poster text. The system structures titles, dates, venues, instructions, and deadlines automatically.
                </CardDescription>
              </Card>

              <Card>
                <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                  <Calendar className="h-5 w-5" />
                </div>
                <CardTitle>Unified Calendar & Deadlines</CardTitle>
                <CardDescription className="mt-2">
                  Event dates and registration deadlines are tracked as distinct entities, preventing missed registration windows for future events.
                </CardDescription>
              </Card>

              <Card>
                <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <CardTitle>Deterministic Priority Engine</CardTitle>
                <CardDescription className="mt-2">
                  Business-rule urgency classification highlights items requiring your immediate attention today, tomorrow, and over the upcoming 7 days.
                </CardDescription>
              </Card>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">How Campus Pulse Works</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">Three straightforward steps to complete campus organisation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Paste or Create Notice</h3>
              <p className="mt-2 text-sm text-slate-500">
                Paste any forwarded message or enter announcement details directly using our resilient manual entry workflow.
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Review & Confirm</h3>
              <p className="mt-2 text-sm text-slate-500">
                Verify and edit extracted dates, venue, and registration links before committing them to the campus database.
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Track & Never Miss</h3>
              <p className="mt-2 text-sm text-slate-500">
                Filter by priority, search across past notices, view upcoming deadlines on the calendar, and generate weekly digests.
              </p>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="bg-indigo-600 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight">Ready to streamline your campus life?</h2>
            <p className="mt-4 text-indigo-100 text-base max-w-xl mx-auto">
              Join students and campus administrators who rely on Campus Pulse for organized college communications.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/signup">
                <Button variant="secondary" size="lg">Create Free Account</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="border-indigo-400 text-white hover:bg-indigo-700">
                  Explore Workspace
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
