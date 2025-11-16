/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: "No API key found",
        message: "GEMINI_API_KEY is not set in environment variables" 
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Test the most common model names directly
    const modelCandidates = [
      'gemini-pro',
      'models/gemini-pro',
      'gemini-1.0-pro',
      'models/gemini-1.0-pro',
      'gemini-1.5-pro',
      'models/gemini-1.5-pro'
    ];

    const testResults: Array<{model: string, success: boolean, error?: string, response?: string}> = [];
    let workingModel: string | null = null;

    for (const modelName of modelCandidates) {
      try {
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            maxOutputTokens: 50,
          },
        });

        const result = await model.generateContent("Reply with just the word 'Connected'");
        const response = await result.response;
        const text = response.text().trim();
        
        testResults.push({
          model: modelName,
          success: true,
          response: text
        });
        
        workingModel = modelName;
        console.log(`✅ Model ${modelName} works! Response: ${text}`);
        break; // Stop at first working model
        
      } catch (error: any) {
        testResults.push({
          model: modelName,
          success: false,
          error: error.message
        });
        console.log(`❌ Model ${modelName} failed:`, error.message);
        continue;
      }
    }

    return NextResponse.json({
      apiKeyStatus: "Present",
      apiKeyPrefix: apiKey.substring(0, 10) + '...',
      workingModel: workingModel,
      testResults: testResults,
      testedModels: modelCandidates,
      suggestion: workingModel 
        ? `Use model: ${workingModel} in your application`
        : "No working models found. Check your Google AI Studio setup and API key permissions."
    });

  } catch (error: any) {
    console.error("Gemini test error:", error);
    return NextResponse.json({
      error: "Gemini API test failed",
      details: error.message,
      status: error?.status,
      suggestion: "Make sure Gemini API is enabled in Google AI Studio and your API key is valid"
    }, { status: 500 });
  }
}