import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {db as prisma} from "@/lib/db"
import { GoogleGenerativeAI } from "@google/generative-ai";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const prompt = "Summarize all the advice in a structured way.";

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ summary: text });
  } catch (err) {
    console.error("AI Summary Error:", err);
    return new NextResponse("Error generating summary", { status: 500 });
  }
}
