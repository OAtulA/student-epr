"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Brain, Sparkles, Lightbulb, TrendingUp, Loader2 } from "lucide-react";
import { MarkdownResponse } from "@/components/student/MarkdownResponse";

interface AISummary {
  summary: string;
  keyThemes: string[];
  recommendations: string[];
  warnings: string[];
  generatedAt: string;
}


export default function AIAdvicePage() {
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const [customAnswer, setCustomAnswer] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [adviceStats, setAdviceStats] = useState<any>(null);

  useEffect(() => {
    fetchAdviceStats();
  }, []);

  const fetchAdviceStats = async () => {
    try {
      const response = await fetch("/api/student/advice/stats");
      if (response.ok) {
        const data = await response.json();
        setAdviceStats(data);
      }
    } catch (error) {
      console.error("Error fetching advice stats:", error);
    }
  };

  const generateAISummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const response = await fetch("/api/student/ai/summary");
      if (response.ok) {
        const data = await response.json();
        const parsed = parseAISummary(data.summary);
        setAiSummary(parsed);
      } else {
        alert("Failed to generate AI summary");
      }
    } catch (error) {
      console.error("Error generating AI summary:", error);
      alert("Failed to generate AI summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const askCustomQuestion = async () => {
    if (!customQuestion.trim()) {
      alert("Please enter your question");
      return;
    }

    setIsGeneratingAnswer(true);
    try {
      const response = await fetch("/api/student/ai/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: customQuestion }),
      });

      if (response.ok) {
        const data = await response.json();
        const parsedResponse = parseAIResponse(data.data);
        setCustomAnswer(parsedResponse);
      } else {
        alert("Failed to get AI answer");
      }
    } catch (error) {
      console.error("Error asking AI:", error);
      alert("Failed to get AI answer");
    } finally {
      setIsGeneratingAnswer(false);
    }
  };

  const parseAISummary = (summary: string): AISummary => {
    // Simple parsing logic - you might want to make this more robust
    const lines = summary.split("\n").filter((line) => line.trim());

    return {
      summary: lines[0] || "No summary available",
      keyThemes: lines
        .filter((line) => line.includes("•") || line.includes("-"))
        .slice(0, 5),
      recommendations: lines
        .filter(
          (line) =>
            line.toLowerCase().includes("recommend") || line.includes("✅")
        )
        .slice(0, 3),
      warnings: lines
        .filter(
          (line) => line.toLowerCase().includes("avoid") || line.includes("⚠️")
        )
        .slice(0, 2),
      generatedAt: new Date().toISOString(),
    };
  };

  const parseAIResponse = (response: string): string => {
    // Format and structure the AI response with better markdown formatting
    // Add consistent spacing between sections
    const lines = response.split("\n");
    const formatted: string[] = [];

    lines.forEach((line, index) => {
      formatted.push(line);

      // Add spacing after headings and list items for better readability
      if (
        line.startsWith("#") ||
        line.match(/^[-•*]\s/) ||
        line.match(/^\d+\.\s/)
      ) {
        if (index < lines.length - 1 && lines[index + 1].trim() !== "") {
          // Don't add space if next line is also special
          if (!lines[index + 1].match(/^[-•*#\d+.]/)) {
            // Space added after heading/list before regular text
          }
        }
      }
    });

    return formatted.join("\n");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8 text-purple-600" />
          AI-Powered Advice
        </h1>
        <p className="text-muted-foreground">
          Get smart insights and personalized recommendations using AI
        </p>
      </div>

      {/* Stats */}
      {adviceStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Advice
              </CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adviceStats.totalAdvice}
              </div>
              <p className="text-xs text-muted-foreground">Pieces analyzed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Ready</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adviceStats.aiReady ? "Yes" : "No"}
              </div>
              <p className="text-xs text-muted-foreground">
                AI Analysis available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Key Themes</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adviceStats.themesCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Identified patterns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Last Updated
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Now</div>
              <p className="text-xs text-muted-foreground">
                Real-time analysis
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Smart Advice Summary
            </CardTitle>
            <CardDescription>
              AI-powered analysis of all senior advice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiSummary ? (
              <div className="space-y-4">
                {/* Overall Summary */}
                <div>
                  <Label className="text-sm font-medium">Overall Summary</Label>
                  <p className="text-sm text-muted-foreground mt-1 bg-blue-50 p-3 rounded-lg">
                    {aiSummary.summary}
                  </p>
                </div>

                {/* Key Themes */}
                <div>
                  <Label className="text-sm font-medium">Key Themes</Label>
                  <div className="mt-2 space-y-1">
                    {aiSummary.keyThemes.map((theme, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 text-sm"
                      >
                        <Lightbulb className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>
                          {theme.replace("•", "").replace("-", "").trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <Label className="text-sm font-medium">Recommendations</Label>
                  <div className="mt-2 space-y-1">
                    {aiSummary.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 text-sm"
                      >
                        <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                        <span>{rec.replace("✅", "").trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                {aiSummary.warnings.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">
                      Things to Avoid
                    </Label>
                    <div className="mt-2 space-y-1">
                      {aiSummary.warnings.map((warning, index) => (
                        <Badge
                          key={index}
                          variant="destructive"
                          className="text-xs"
                        >
                          {warning.replace("⚠️", "").trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={generateAISummary} variant="outline" size="sm">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Regenerate Summary
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No AI Summary Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate a smart summary of all senior advice using AI
                </p>
                <Button
                  onClick={generateAISummary}
                  disabled={isGeneratingSummary}
                >
                  {isGeneratingSummary ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Advice...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Summary
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ask AI */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Ask AI Mentor
            </CardTitle>
            <CardDescription>
              Get personalized advice based on your specific situation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Your Question</Label>
              <Textarea
                id="question"
                placeholder="e.g., How can I improve my programming skills? What's the best way to prepare for semester exams? How to balance studies and Smart Advice Summary?"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                className="min-h-[120px] resize-vertical"
              />
            </div>

            <Button
              onClick={askCustomQuestion}
              disabled={isGeneratingAnswer}
              className="w-full"
            >
              {isGeneratingAnswer ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Ask AI Mentor
                </>
              )}
            </Button>

            {customAnswer && (
              <div className="mt-4 p-4 bg-linear-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <Label className="text-sm font-medium text-purple-700">
                  AI Response
                </Label>
                <div className="mt-3 text-sm text-purple-900 max-w-none">
                  <MarkdownResponse content={customAnswer} />
                </div>
              </div>
            )}

            {/* Example Questions */}
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium">Example Questions:</Label>
              <div className="mt-2 space-y-2">
                {[
                  "How should I prepare for Data Structures exams?",
                  "What's the best way to manage time during finals?",
                  "How can I improve my grades in theory subjects?",
                  "What extracurricular activities help with placement?",
                ].map((example, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => setCustomQuestion(example)}
                  >
                    <span className="text-sm text-muted-foreground">
                      &ldquo;{example}&rdquo;
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Performance Insights
          </CardTitle>
          <CardDescription>
            AI analysis of your academic performance and personalized
            recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Performance Analysis</h3>
            <p className="text-muted-foreground mb-4">
              Connect your marks data to get personalized AI insights about your
              academic performance
            </p>
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analyze My Performance (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
