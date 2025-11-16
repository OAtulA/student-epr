"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  MessageSquare,
  Users,
  Star,
  ThumbsUp,
} from "lucide-react";

interface Advice {
  id: string;
  advice: string;
  isGeneral: boolean;
  createdAt: string;
  subject?: {
    name: string;
    code: string;
  };
  student: {
    name: string;
    batch: string;
  };
  likes?: number;
  isLiked?: boolean;
}

interface AdviceData {
  advice: Advice[];
  subjects: string[];
  batches: string[];
  summary: {
    totalAdvice: number;
    generalAdvice: number;
    subjectAdvice: number;
  };
}

export default function AdvicePage() {
  const [adviceData, setAdviceData] = useState<AdviceData | null>(null);
  const [filteredAdvice, setFilteredAdvice] = useState<Advice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchAdvice();
  }, []);

  const filterAdvice = useCallback(() => {
    if (!adviceData) return;

    let filtered = adviceData.advice;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.advice.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.subject?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply subject filter
    if (subjectFilter !== "all") {
      filtered = filtered.filter((item) =>
        item.isGeneral ? false : item.subject?.name === subjectFilter
      );
    }

    // Apply batch filter
    if (batchFilter !== "all") {
      filtered = filtered.filter((item) => item.student.batch === batchFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      if (typeFilter === "general") {
        filtered = filtered.filter((item) => item.isGeneral);
      } else if (typeFilter === "subject") {
        filtered = filtered.filter((item) => !item.isGeneral);
      }
    }

    setFilteredAdvice(filtered);
  }, [adviceData, batchFilter, searchTerm, subjectFilter, typeFilter]);

  useEffect(() => {
    filterAdvice();
  }, [
    adviceData,
    searchTerm,
    subjectFilter,
    batchFilter,
    typeFilter,
    filterAdvice,
  ]);

  const fetchAdvice = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/student/advice");
      if (response.ok) {
        const data = await response.json();
        setAdviceData(data);
      }
    } catch (error) {
      console.error("Error fetching advice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (adviceId: string) => {
    // Optimistic update
    setAdviceData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        advice: prev.advice.map((item) =>
          item.id === adviceId
            ? {
                ...item,
                likes: (item.likes || 0) + (item.isLiked ? -1 : 1),
                isLiked: !item.isLiked,
              }
            : item
        ),
      };
    });

    try {
      await fetch("/api/student/advice/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adviceId }),
      });
    } catch (error) {
      console.error("Error liking advice:", error);
      // Revert optimistic update on error
      fetchAdvice();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advice from Seniors</h1>
        <p className="text-muted-foreground">
          Get valuable tips and guidance from students who&apos;ve been there
          before
        </p>
      </div>

      {/* Stats */}
      {adviceData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Advice
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adviceData.summary.totalAdvice}
              </div>
              <p className="text-xs text-muted-foreground">Pieces of advice</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                General Advice
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adviceData.summary.generalAdvice}
              </div>
              <p className="text-xs text-muted-foreground">Overall guidance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Subject Advice
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adviceData.summary.subjectAdvice}
              </div>
              <p className="text-xs text-muted-foreground">
                Course-specific tips
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Contributors
              </CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adviceData.batches.length}
              </div>
              <p className="text-xs text-muted-foreground">Different batches</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Advice</CardTitle>
          <CardDescription>
            Find the most relevant advice for your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search advice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {adviceData?.subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All batches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {adviceData?.batches.map((batch) => (
                    <SelectItem key={batch} value={batch}>
                      {batch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General Advice</SelectItem>
                  <SelectItem value="subject">Subject Advice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actions">Actions</Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setSubjectFilter("all");
                  setBatchFilter("all");
                  setTypeFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advice List */}
      <Card>
        <CardHeader>
          <CardTitle>Advice Collection</CardTitle>
          <CardDescription>
            {filteredAdvice.length} pieces of advice found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading advice...</div>
          ) : filteredAdvice.length > 0 ? (
            <div className="space-y-6">
              {filteredAdvice.map((item) => (
                <div
                  key={item.id}
                  className="p-6 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{item.student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.student.batch} Batch
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </p>
                      {item.isGeneral ? (
                        <Badge variant="secondary" className="mt-1">
                          General Advice
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mt-1">
                          {item.subject?.name}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {item.advice}
                  </p>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(item.id)}
                      className={`flex items-center space-x-2 ${
                        item.isLiked ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{item.likes || 0}</span>
                      <span>Helpful</span>
                    </Button>

                    {!item.isGeneral && item.subject && (
                      <Badge variant="outline">{item.subject.code}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No Advice Found</h3>
              <p className="text-muted-foreground mb-4">
                {adviceData?.advice.length === 0
                  ? "No advice has been shared yet. Be the first to contribute!"
                  : "No advice matches your current filters."}
              </p>
              <Button asChild>
                <a href="/student/give-advice">Share Your Advice</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
