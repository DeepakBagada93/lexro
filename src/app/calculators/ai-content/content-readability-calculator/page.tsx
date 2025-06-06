
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { BookOpenCheck, ScanText, AlertTriangle } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ReadabilityMetrics {
  charCount: number;
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  avgCharsPerWord: number;
}

export default function ContentReadabilityCalculatorPage() {
  const [inputText, setInputText] = useState<string>("");
  const [metrics, setMetrics] = useState<ReadabilityMetrics | null>(null);

  const analyzeText = () => {
    if (!inputText.trim()) {
      setMetrics(null);
      return;
    }

    const charCount = inputText.length;
    
    const words = inputText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Simple sentence counter (may not be perfect for all cases)
    const sentences = inputText.trim().split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length || 1; // Avoid division by zero

    const avgWordsPerSentence = wordCount > 0 && sentenceCount > 0 ? parseFloat((wordCount / sentenceCount).toFixed(2)) : 0;
    
    // Approximate average characters per word (total chars in words / word count)
    const totalCharsInWords = words.reduce((sum, word) => sum + word.length, 0);
    const avgCharsPerWord = wordCount > 0 ? parseFloat((totalCharsInWords / wordCount).toFixed(2)) : 0;


    setMetrics({
      charCount,
      wordCount,
      sentenceCount,
      avgWordsPerSentence,
      avgCharsPerWord,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <BookOpenCheck size={28} className="text-primary" />
              Basic Text Analysis
            </CardTitle>
            <CardDescription>Get basic statistics about your text. For a full readability score like Flesch-Kincaid, specialized tools are recommended.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="textToAnalyze" className="font-medium">Your Content</Label>
              <Textarea
                id="textToAnalyze"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste or type your content here..."
                rows={10}
                className="resize-y"
              />
            </div>

            <Button onClick={analyzeText} className="w-full sm:w-auto">
              <ScanText size={18} className="mr-2" />
              Analyze Text
            </Button>

            {metrics && (
              <div className="mt-6 space-y-4 p-6 bg-muted/30 rounded-lg border">
                <h3 className="text-xl font-semibold text-center text-primary font-headline mb-4">Text Analysis Results</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-card rounded-md shadow-sm">
                    <p className="text-sm text-muted-foreground">Character Count</p>
                    <p className="text-lg font-semibold">{metrics.charCount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-card rounded-md shadow-sm">
                    <p className="text-sm text-muted-foreground">Word Count</p>
                    <p className="text-lg font-semibold">{metrics.wordCount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-card rounded-md shadow-sm">
                    <p className="text-sm text-muted-foreground">Sentence Count</p>
                    <p className="text-lg font-semibold">{metrics.sentenceCount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-card rounded-md shadow-sm">
                    <p className="text-sm text-muted-foreground">Avg. Words/Sentence</p>
                    <p className="text-lg font-semibold">{metrics.avgWordsPerSentence.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-card rounded-md shadow-sm">
                    <p className="text-sm text-muted-foreground">Avg. Chars/Word (approx.)</p>
                    <p className="text-lg font-semibold">{metrics.avgCharsPerWord.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
            
            <Alert variant="default" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Note on Analysis</AlertTitle>
              <AlertDescription>
                This tool provides basic text statistics. True readability scores (e.g., Flesch-Kincaid, Gunning Fog) involve more complex linguistic analysis, such as accurate syllable counting, which is not implemented here. For precise readability assessments, please use dedicated readability scoring tools.
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
