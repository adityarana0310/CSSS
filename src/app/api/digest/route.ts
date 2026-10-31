import { NextResponse } from "next/server";
import { getAIProvider, AIQuotaExceededError } from "@/lib/ai/gemini-provider";
import { createAdminClient } from "@/lib/supabase/admin";
import { MOCK_TEST_EXTRACTION_RESPONSE } from "@/lib/ai/fixtures";
import { ExtractedAnnouncement } from "@/lib/ai/types";

export async function POST() {
  const ai = getAIProvider();
  if (!ai) {
    return NextResponse.json(
      { error: "AI provider is not configured. Please check GEMINI_API_KEY." },
      { status: 503 }
    );
  }

  let announcements: ExtractedAnnouncement[] = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (data && data.length > 0) {
      announcements = data.map((a) => ({
        title: a.title,
        description: a.description || "",
        category: a.category,
        event_date: a.event_date,
        event_time: a.event_time,
        timezone: a.timezone || "Asia/Kolkata",
        venue: a.venue,
        registration_deadline: a.registration_deadline,
        registration_url: a.registration_url,
        priority: a.priority,
        instructions: a.instructions || [],
        missing_fields: a.missing_fields || [],
        extraction_confidence: a.extraction_confidence ?? 1.0,
      }));
    }
  } catch {
    // If DB fails, use test fixture announcements for synthesis
    announcements = MOCK_TEST_EXTRACTION_RESPONSE.announcements;
  }

  try {
    const digest = await ai.generateWeeklyDigest(announcements);
    return NextResponse.json({ digest });
  } catch (err: unknown) {
    if (err instanceof AIQuotaExceededError) {
      return NextResponse.json(
        {
          error: "Gemini quota exceeded.",
          isQuotaExceeded: true,
        },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error generating digest" },
      { status: 500 }
    );
  }
}
