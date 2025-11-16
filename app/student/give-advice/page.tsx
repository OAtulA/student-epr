/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MessageSquare, BookOpen, Star, Users } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface AdviceForm {
  advice: string;
  adviceType: "general" | "subject";
  subjectId?: string;
  isGeneral: boolean;
}

export default function GiveAdvicePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [formData, setFormData] = useState<AdviceForm>({
    advice: "",
    adviceType: "general",
    subjectId: "",
    isGeneral: true,
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/student/subjects");
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "adviceType") {
      const isGeneral = value === "general";
      setFormData(prev => ({
        ...prev,
        adviceType: value as "general" | "subject",
        isGeneral: isGeneral,
        subjectId: isGeneral ? "" : prev.subjectId,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.advice.trim()) {
      alert("Please write your advice before submitting.");
      return;
    }

    if (formData.adviceType === "subject" && !formData.subjectId) {
      alert("Please select a subject for subject-specific advice.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/student/advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          advice: formData.advice.trim(),
          isGeneral: formData.isGeneral,
          subjectId: formData.isGeneral ? null : formData.subjectId,
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          advice: "",
          adviceType: "general",
          subjectId: "",
          isGeneral: true,
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit advice");
      }
    } catch (error) {
      console.error("Error submitting advice:", error);
      alert("Failed to submit advice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const adviceExamples = {
    general: [
      "Manage your time effectively by creating a study schedule",
      "Don't hesitate to ask professors for help during office hours",
      "Join student clubs to build your network and skills",
      "Take care of your mental health - it's as important as academics",
    ],
    subject: [
      "For programming subjects, practice coding daily rather than cramming",
      "Make summary notes for theory subjects to revise quickly before exams",
      "Form study groups for difficult subjects to learn from peers",
      "Focus on understanding concepts rather than memorizing for technical subjects",
    ],
  };

  if (submitSuccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Share Your Advice</h1>
          <p className="text-muted-foreground">
            Help your juniors by sharing your experiences and insights
          </p>
        </div>

        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Star className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-medium mb-1">Advice Submitted Successfully!</h3>
              <p className="text-muted-foreground mb-4">
                Thank you for contributing to the student community. Your advice will help many students.
              </p>
              <div className="space-x-2">
                <Button onClick={() => setSubmitSuccess(false)}>
                  Share More Advice
                </Button>
                <Button variant="outline" asChild>
                  <a href="/student/advice">View All Advice</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Share Your Advice</h1>
        <p className="text-muted-foreground">
          Help your juniors by sharing your experiences and insights
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Advice Form */}
        <Card>
          <CardHeader>
            <CardTitle>Share Your Wisdom</CardTitle>
            <CardDescription>
              Your advice can make a big difference for other students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Advice Type */}
              <div className="space-y-4">
                <Label>Advice Type</Label>
                <RadioGroup
                  value={formData.adviceType}
                  onValueChange={(value) => handleInputChange("adviceType", value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="general" id="general" />
                    <Label htmlFor="general" className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>General Advice</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="subject" id="subject" />
                    <Label htmlFor="subject" className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Subject-specific</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Subject Selection */}
              {formData.adviceType === "subject" && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Select Subject</Label>
                  <Select
                    value={formData.subjectId}
                    onValueChange={(value) => handleInputChange("subjectId", value)}
                    required={formData.adviceType === "subject"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.code} - {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Advice Text */}
              <div className="space-y-2">
                <Label htmlFor="advice">
                  Your Advice {formData.adviceType === "general" ? "(General Guidance)" : "(Subject-specific Tips)"}
                </Label>
                <Textarea
                  id="advice"
                  placeholder={
                    formData.adviceType === "general"
                      ? "Share general study tips, time management advice, campus life suggestions, etc..."
                      : "Share specific tips for this subject - study techniques, important topics, exam strategies, etc..."
                  }
                  value={formData.advice}
                  onChange={(e) => handleInputChange("advice", e.target.value)}
                  className="min-h-[200px] resize-vertical"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Write clear, helpful advice based on your personal experience
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Share Your Advice
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tips and Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Writing Good Advice</CardTitle>
            <CardDescription>
              Make your advice valuable and easy to understand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tips */}
            <div className="space-y-3">
              <h4 className="font-medium">Tips for Great Advice:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                  <span>Be specific and practical</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                  <span>Share what worked for you personally</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                  <span>Keep it positive and encouraging</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                  <span>Focus on actionable steps</span>
                </li>
              </ul>
            </div>

            {/* Examples */}
            <div className="space-y-3">
              <h4 className="font-medium">
                {formData.adviceType === "general" ? "General Advice Examples:" : "Subject Advice Examples:"}
              </h4>
              <div className="space-y-2">
                {adviceExamples[formData.adviceType].map((example, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg bg-muted/50 text-sm"
                    onClick={() => setFormData(prev => ({ ...prev, advice: example }))}
                  >
                    <p className="cursor-pointer hover:text-blue-600 transition-colors">
                      &ldquo;{example}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-700">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-medium">Your Impact</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Your advice could help dozens of students avoid common mistakes and achieve better results.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}