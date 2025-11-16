/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from '@google/generative-ai';

interface GeminiContext {
  batch: string;
  discipline: string;
  currentSemester: number;
  existingAdvice?: string[];
}

interface StudentPerformanceData {
  subject: string;
  marks: number;
  semester: string | number;
}

// Initialize with better error handling
let genAI: GoogleGenerativeAI | null = null;
let WORKING_MODEL: string = 'gemini-pro'; // Default

try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim() !== '') {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('Gemini AI initialized successfully');
  } else {
    console.warn('GEMINI_API_KEY is missing or empty');
  }
} catch (error) {
  console.error('Failed to initialize Gemini AI:', error);
}

export async function generateAdviceSummary(advices: string[]): Promise<string> {
  try {
    if (!genAI) {
      throw new Error('Gemini AI not initialized - check GEMINI_API_KEY');
    }

    const model = genAI.getGenerativeModel({ 
      model: WORKING_MODEL,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const prompt = `
You are an academic advisor helping college students. Below are multiple pieces of advice from senior students. 
Please analyze them and provide a comprehensive summary with key insights.

ADVICE COLLECTION:
${advices.join('\n\n')}

Please provide a well-structured summary that includes:
1. A concise overall summary (2-3 sentences)
2. 3-5 key themes or patterns you noticed across the advice
3. 3-5 actionable recommendations for current students
4. Any important warnings or common mistakes to avoid

Format the response in a clear, student-friendly way. Use bullet points for lists and keep it practical and encouraging.
Keep the response under 500 words.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error: any) {
    console.error('Error generating advice summary:', error);
    
    // Provide fallback summary
    return createFallbackSummary(advices);
  }
}

export async function analyzeStudentPerformance(marks: StudentPerformanceData[], studentInfo: any): Promise<string> {
  try {
    if (!genAI) {
      throw new Error('Gemini AI not initialized - check GEMINI_API_KEY');
    }

    const model = genAI.getGenerativeModel({ 
      model: WORKING_MODEL,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const prompt = `
You are an academic advisor. Analyze this student's performance and provide personalized study advice.

STUDENT INFORMATION:
- Batch: ${studentInfo.batch}
- Discipline: ${studentInfo.discipline}
- Current Semester: ${studentInfo.currentSemester}

PERFORMANCE DATA:
${JSON.stringify(marks, null, 2)}

Please provide a comprehensive analysis that includes:
1. Overall performance assessment
2. Key strengths and areas for improvement
3. Personalized study recommendations based on their performance pattern
4. Tips for upcoming semesters and long-term success

Keep it encouraging, practical, and actionable.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error: any) {
    console.error('Error analyzing student performance:', error);
    throw new Error('Failed to generate performance analysis');
  }
}

export async function generateSmartAdvice(question: string, context: GeminiContext): Promise<string> {
  try {
    if (!genAI) {
      throw new Error('Gemini AI not initialized - check GEMINI_API_KEY');
    }

    const model = genAI.getGenerativeModel({ 
      model: WORKING_MODEL,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const prompt = `
You are a senior student mentor. A student is asking for advice with this context:

STUDENT CONTEXT:
- Batch: ${context.batch}
- Discipline: ${context.discipline}
- Current Semester: ${context.currentSemester}

QUESTION: ${question}

EXISTING ADVICE FROM SENIORS:
${context.existingAdvice?.slice(0, 5).join('\n\n') || 'No specific advice available yet.'}

Please provide helpful, practical advice that:
1. Directly addresses their question
2. Offers 2-3 actionable tips based on their context  
3. Includes encouragement and motivation
4. Suggests additional resources if relevant

Be friendly and supportive.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error: any) {
    console.error('Error generating smart advice:', error);
    
    if (error?.status === 404) {
      throw new Error('AI model not available - please check configuration');
    } else if (error?.status === 403) {
      throw new Error('AI service access denied - check API key');
    } else if (error?.status === 429) {
      throw new Error('AI service quota exceeded - try again later');
    } else {
      throw new Error(`AI service unavailable: ${error.message}`);
    }
  }
}

// Fallback function when Gemini is not available
function createFallbackSummary(advices: string[]): string {
  if (advices.length === 0) {
    return "No advice available yet. Check back later for insights from senior students!";
  }

  return `Based on advice from ${advices.length} senior students:

Key Recommendations:
• Focus on consistent study habits rather than last-minute preparation
• Balance your academic work with practical projects and experiences  
• Don't hesitate to ask professors and peers for help when needed
• Manage your time effectively between coursework and personal life

Remember that every student's journey is unique. Use this advice as guidance, but find the approaches that work best for you!`;
}

// Utility function to check if Gemini is configured
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY && !!genAI;
}

// Set the working model (call this after testing)
export function setWorkingModel(modelName: string): void {
  WORKING_MODEL = modelName;
  console.log(`Gemini working model set to: ${modelName}`);
}