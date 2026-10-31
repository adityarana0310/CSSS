import { NextRequest, NextResponse } from "next/server";
import { getAIProvider, AIQuotaExceededError, AIAuthError } from "@/lib/ai/gemini-provider";
import { AIProviderUnavailableError } from "@/lib/ai/types";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text payload is required." },
        { status: 400 }
      );
    }

    const aiProvider = getAIProvider();
    if (!aiProvider) {
      return NextResponse.json(
        { 
          error: "GEMINI_API_KEY is not configured on the server. Please use manual entry mode.",
          isUnavailable: true 
        },
        { status: 503 }
      );
    }

    try {
      const result = await aiProvider.extractAnnouncements(text);
      return NextResponse.json(result);
    } catch (aiErr: unknown) {
      if (aiErr instanceof AIQuotaExceededError) {
        return NextResponse.json(
          {
            error: "Gemini API quota exceeded. You can proceed seamlessly with our manual entry workflow below.",
            isQuotaExceeded: true,
          },
          { status: 429 }
        );
      }
      if (aiErr instanceof AIAuthError) {
        return NextResponse.json(
          { error: aiErr.message, isAuthError: true },
          { status: 401 }
        );
      }
      if (aiErr instanceof AIProviderUnavailableError) {
        return NextResponse.json(
          { error: aiErr.message, isUnavailable: true },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: aiErr instanceof Error ? aiErr.message : "AI extraction error" },
        { status: 500 }
      );
    }
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
