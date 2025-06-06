
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { FileJson, Calculator, AlertTriangle } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EstimationResult {
  charCount: number;
  wordCount: number;
  tokensByChars: number;
  tokensByWords: number;
}

export default function TokenEstimatorPage() {
  const [inputText, setInputText] = useState<string>("");
  const [result, setResult] = useState<EstimationResult | null>(null);

  const handleEstimate = () => {
    if (!inputText.trim()) {
      setResult(null);
      return;
    }

    const charCount = inputText.length;
    const words = inputText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Common heuristics for token estimation
    const tokensByChars = Math.ceil(charCount / 4);
    const tokensByWords = Math.ceil(wordCount / 0.75);

    setResult({
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
              <FileJson size={28} className="text-primary" />
              Token Estimator for OpenAI API
            </CardTitle>
            <CardDescription>Paste your text below to get an approximate token count based on common heuristics. Useful for estimating API usage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="textToEstimate" className="font-medium">Your Text</Label>
              <Textarea
                id="textToEstimate"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste or type your text here..."
                rows={8}
                className="resize-y"
              />
            </div>

            <Button onClick={handleEstimate} className="w-full sm:w-auto">
              <Calculator size={18} className="mr-2" />
              Estimate Tokens
            </Button>

            {result && (
              <div className="mt-6 space-y-4 p-6 bg-muted/30 rounded-lg border">
                <h3 className="text-xl font-semibold text-center text-primary font-headline mb-4">Estimation Results</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-card rounded-md shadow-sm">
                    <p className="text-sm text-muted-foreground">Character Count</p>
                    <p className="text-lg font-semibold">{result.charCount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-card rounded-md shadow-sm">
                    <p className="text-sm text-muted-foreground">Word Count</p>
                    <p className="text-lg font-semibold">{result.wordCount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-card rounded-md shadow-sm">
                    <p className="text-sm text-muted-foreground">Est. Tokens (by chars)</p>
                    <p className="text-lg font-semibold">{result.tokensByChars.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">(chars / 4)</p>
                  </div>
                  <div className="p-3 bg-card rounded-md shadow-sm">
                    <p className="text-sm text-muted-foreground">Est. Tokens (by words)</p>
                    <p className="text-lg font-semibold">{result.tokensByWords.toLocaleString()}</p>
                     <p className="text-xs text-muted-foreground">(words / 0.75)</p>
                  </div>
                </div>
              </div>
            )}
            
            <Alert variant="default" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Disclaimer</AlertTitle>
              <AlertDescription>
                Token estimations are approximate. OpenAI's official tokenization process is complex and can vary. This tool uses common heuristics (1 token ≈ 4 characters or 1 token ≈ 0.75 words). For precise counts, use OpenAI's official tools or libraries.
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
