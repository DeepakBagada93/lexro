
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { TextCursorInput, RefreshCcw, AlertTriangle } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PromptAnalysisResult {
  charCount: number;
  wordCount: number;
  tokensByChars: number;
  tokensByWords: number;
}

export default function PromptLengthCheckerPage() {
  const [promptText, setPromptText] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<PromptAnalysisResult | null>(null);

  const handleAnalyzePrompt = () => {
    if (!promptText.trim()) {
      setAnalysisResult(null);
      return;
    }

    const charCount = promptText.length;
    const words = promptText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Common heuristics for token estimation
    const tokensByChars = Math.ceil(charCount / 4);
    const tokensByWords = Math.ceil(wordCount / 0.75);

    setAnalysisResult({
      charCount,
      wordCount,
      tokensByChars,
      tokensByWords,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <TextCursorInput size={28} className="text-primary" />
              Prompt Length Checker
            </CardTitle>
            <CardDescription>Enter your prompt below to analyze its length in characters, words, and estimated tokens.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="promptInput" className="font-medium">Your Prompt</Label>
              <Textarea
                id="promptInput"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Type or paste your prompt here..."
                rows={6}
                className="resize-y"
              />
            </div>

            <Button onClick={handleAnalyzePrompt} className="w-full sm:w-auto">
              <RefreshCcw size={18} className="mr-2" />
              Analyze Prompt
            </Button>

            {analysisResult && (
              <div className="mt-6 space-y-4 p-6 bg-muted/30 rounded-lg border">
                <h3 className="text-xl font-semibold text-center text-primary font-headline mb-4">Analysis Results</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-card rounded-md shadow-sm">
                    <p className="text-sm text-muted-foreground">Character Count</p>
                    <p className="text-lg font-semibold">{analysisResult.charCount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-card rounded-md shadow-sm">
                    <p className="text-sm text-muted-foreground">Word Count</p>
                    <p className="text-lg font-semibold">{analysisResult.wordCount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-card rounded-md shadow-sm">
                    <p className="text-sm text-muted-foreground">Est. Tokens (by chars)</p>
                    <p className="text-lg font-semibold">{analysisResult.tokensByChars.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">(chars / 4)</p>
                  </div>
                  <div className="p-3 bg-card rounded-md shadow-sm">
                    <p className="text-sm text-muted-foreground">Est. Tokens (by words)</p>
                    <p className="text-lg font-semibold">{analysisResult.tokensByWords.toLocaleString()}</p>
                     <p className="text-xs text-muted-foreground">(words / 0.75)</p>
                  </div>
                </div>
              </div>
            )}
            
            <Alert variant="default" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Note on Token Estimation</AlertTitle>
              <AlertDescription>
                Token counts are estimates based on common heuristics. The actual tokenization process used by specific AI models (like OpenAI's) can be more complex and may yield different results. For precise counts, refer to the model provider's official tokenizer or tools.
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
