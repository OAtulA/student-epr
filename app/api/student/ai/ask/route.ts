import {
  GoogleGenerativeAI,
  GenerateContentResult,
} from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { question } = await req.json();

  console.log("question:", question);

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "GEMINI_API_KEY is not set" },
      { status: 500 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `You are an expert academic advisor. Provide a detailed, thoughtful, and helpful answer to the student's question below.
 The answer should include practical tips, resources, and encouragement to help the student succeed in their studies.
 The syllabus is of B.Tech level computer science courses.
Student's Question: ${question}`;

    const result: GenerateContentResult = await model.generateContent(prompt);

    // 🛑 CRITICAL FIX: Check if the response object is defined
    if (!result.response) {
      console.error(
        "Gemini API returned an incomplete result (response object missing):",
        result
      );
      return NextResponse.json(
        {
          ok: false,
          error:
            "Gemini API failed to generate a complete response. Check console for full result object.",
        },
        { status: 500 }
      );
    } // Now that we've checked result.response is defined, we can safely access its properties
    // Note: The 'contents' error often happens because result.response is undefined

    // const generatedText = result.response.text;
    const generatedText = result.response.text();

    // if (!generatedText) {
    //   console.error(
    //     "Gemini API returned no text (potential block/safety issue):",
    //     result.response.candidates
    //   );
    //   return NextResponse.json(
    //     {
    //       ok: false,
    //       error:
    //         "Gemini API failed to generate a response (possible safety block or empty output).",
    //     },
    //     { status: 500 }
    //   );
    // }
    if (!generatedText) {
      // If the text is empty after conversion, handle it as a safety block/failure.
      console.error(
        "Gemini API returned an incomplete result (response object missing or empty text):",
        result.response.candidates
      );
      return NextResponse.json(
        {
          ok: false,
          error:
            "Gemini API failed to generate a response (possible safety block or empty output).",
        },
        { status: 500 }
      );
    }
    const responseBody = JSON.stringify({ ok: true, data: generatedText });
    console.log("RESPONSE PAYLOAD LENGTH:", responseBody.length);
    console.log("RESPONSE PAYLOAD START:", responseBody.substring(0, 100));

    return new NextResponse(responseBody, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    // return NextResponse.json({ ok: true, data: generatedText });
  } catch (err) {
    console.error("Gemini error (final catch):", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: `Internal Server Error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
