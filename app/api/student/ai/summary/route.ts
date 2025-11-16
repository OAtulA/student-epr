import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import {
  GoogleGenerativeAI,
  GenerateContentResult,
} from "@google/generative-ai";

// Initialization moved inside the handler to allow for env check
export async function GET() {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set" },
      { status: 500 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const adviceList = await prisma.advice.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const combined = adviceList.map((a) => a.advice).join("\n\n");

    if (!combined.trim()) {
      return NextResponse.json({ summary: "No advice found." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // 🛠️ FIX 1: Use correct model alias

    const prompt = `
You are an AI academic mentor.

Summarize all advice neatly into:

1. One paragraph summary  
2. Key themes (5 bullets, short)  
3. Recommendations (3 bullets, actionable)  
4. Warnings (2 bullets, only if necessary)

Output plain text with bullet points (•).
Content:
${combined}
    `;

    // Added type annotation for robustness
    const result: GenerateContentResult = await model.generateContent(prompt);

    // 🛠️ FIX 2: Check for complete response object
    if (!result.response) {
      console.error("AI Summary Error: Incomplete response from Gemini API.");
      return NextResponse.json(
        { error: "Failed to generate summary: Incomplete response" },
        { status: 500 }
      );
    }

    // 🛠️ FIX 3: Use the function call to get the text (based on prior route fix)
    const text = result.response.text();

    // Final check for empty output
    if (!text.trim()) {
      console.warn("AI Summary Warning: Response text was empty.");
      return NextResponse.json({
        summary: "Summary generation returned no text.",
      });
    }

    return NextResponse.json({ summary: text });
  } catch (err) {
    console.error("AI Summary Error (final catch):", err);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
