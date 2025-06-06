
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { Tags, BarChartBig, AlertTriangle, Info } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";

interface KeywordDensityResult {
  keyword: string;
  count: number;
  density: number; // Percentage
}

interface AnalysisReport {
  totalWords: number;
  results: KeywordDensityResult[];
}

export default function KeywordDensityCalculatorPage() {
  const [textContent, setTextContent] = useState<string>("");
  const [keywordsInput, setKeywordsInput] = useState<string>("");
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const getTotalWords = (text: string): number => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const countKeywordOccurrences = (text: string, keyword: string): number => {
    if (!text.trim() || !keyword.trim()) return 0;
    // Regex to match whole words, case-insensitive. Escape special characters in keyword.
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  };

  const handleAnalyze = () => {
    if (!textContent.trim()) {
      toast({ title: "Missing Text", description: "Please enter some content to analyze.", variant: "destructive" });
      return;
    }
    if (!keywordsInput.trim()) {
      toast({ title: "Missing Keywords", description: "Please enter at least one keyword.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setAnalysisReport(null);

    // Simulate processing time for better UX
    setTimeout(() => {
      const totalWords = getTotalWords(textContent);

      if (totalWords === 0 && textContent.trim() !== "") {
         // This case might occur if text is only whitespace, already handled by initial trim check mostly.
         // Or if splitting logic somehow fails, which is unlikely for basic spaces.
         toast({ title: "No Words Found", description: "Could not find any words in the provided text.", variant: "destructive" });
         setAnalysisReport({ totalWords: 0, results: [] });
         setIsLoading(false);
         return;
      }
       if (totalWords === 0 && textContent.trim() === "") {
         // Already covered by the first check, but for safety.
         setAnalysisReport({ totalWords: 0, results: [] });
         setIsLoading(false);
         return;
      }


      const keywords = keywordsInput.split(',')
        .map(kw => kw.trim())
        .filter(Boolean);

      if (keywords.length === 0) {
        toast({ title: "No Valid Keywords", description: "Please ensure keywords are properly entered.", variant: "destructive" });
        setAnalysisReport({ totalWords, results: [] });
        setIsLoading(false);
        return;
      }

      const results: KeywordDensityResult[] = keywords.map(kw => {
        const count = countKeywordOccurrences(textContent, kw);
        const density = totalWords > 0 ? parseFloat(((count / totalWords) * 100).toFixed(2)) : 0;
        return { keyword: kw, count, density };
      });

      setAnalysisReport({ totalWords, results });
      setIsLoading(false);
      if (results.length > 0) {
        toast({ title: "Analysis Complete", description: "Keyword density calculated." });
      }
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Tags size={28} className="text-primary" />
              Keyword Density Calculator
            </CardTitle>
            <CardDescription>Analyze your text to find the density of specific keywords. Helps in SEO and content optimization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="textContent" className="font-medium">Your Text Content</Label>
              <Textarea
                id="textContent"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste or type your full text content here..."
                rows={10}
                className="resize-y"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywordsInput" className="font-medium">Keywords</Label>
              <Input
                id="keywordsInput"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="Enter keywords, separated by commas (e.g., SEO, content, analysis)"
              />
               <p className="text-xs text-muted-foreground">Enter one or more keywords, separated by commas.</p>
            </div>

            <Button onClick={handleAnalyze} disabled={isLoading} className="w-full sm:w-auto">
              <BarChartBig size={18} className="mr-2" />
              {isLoading ? "Analyzing..." : "Analyze Keyword Density"}
            </Button>

            {isLoading && (
                <div className="flex items-center justify-center text-muted-foreground py-4">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </div>
            )}

            {analysisReport && !isLoading && (
              <div className="mt-6 space-y-4 p-6 bg-muted/30 rounded-lg border">
                <h3 className="text-xl font-semibold text-center text-primary font-headline mb-4">Analysis Report</h3>
                <div className="p-3 bg-card rounded-md shadow-sm text-center mb-4">
                  <p className="text-sm text-muted-foreground">Total Words in Text</p>
                  <p className="text-2xl font-semibold">{analysisReport.totalWords.toLocaleString()}</p>
                </div>
                
                {analysisReport.results.length > 0 ? (
                  <div className="space-y-3">
                    {analysisReport.results.map((result) => (
                      <div key={result.keyword} className="p-4 bg-card rounded-md shadow-sm">
                        <h4 className="text-lg font-semibold text-primary/90">{result.keyword}</h4>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div>
                            <p className="text-xs text-muted-foreground">Occurrences</p>
                            <p className="text-md font-medium">{result.count.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Density</p>
                            <p className="text-md font-medium">{result.density}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No keywords were analyzed, or no occurrences found for the specified keywords.</p>
                )}
              </div>
            )}
            
            <Alert variant="default" className="mt-6">
              <Info className="h-4 w-4" />
              <AlertTitle>About Keyword Density</AlertTitle>
              <AlertDescription>
                Keyword density is the percentage of times a keyword or phrase appears on a web page compared to the total number of words on the page. 
                This calculator provides a basic analysis (case-insensitive, whole word matching). For advanced SEO, consider factors like keyword variations, LSI keywords, and context.
              </AlertDescription>
            </Alert>

          </CardContent>
        </Card>
      </main>
      <footer className="text-center py-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Lexro AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

