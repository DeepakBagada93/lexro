
"use client";

import React, { useState, useEffect } from 'react';
import { GitCompareArrows, RefreshCw } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";

interface WouldYouRatherQuestion {
  choice1: string;
  choice2: string;
}

const predefinedQuestions: WouldYouRatherQuestion[] = [
  { choice1: "Be able to fly", choice2: "Be able to be invisible" },
  { choice1: "Have more time", choice2: "Have more money" },
  { choice1: "Travel to the past", choice2: "Travel to the future" },
  { choice1: "Be able to talk to animals", choice2: "Be able to speak all human languages fluently" },
  { choice1: "Give up social media forever", choice2: "Give up watching movies and TV shows forever" },
  { choice1: "Live without music", choice2: "Live without books" },
  { choice1: "Always be 10 minutes late", choice2: "Always be 20 minutes early" },
  { choice1: "Have a personal chef", choice2: "Have a personal chauffeur" },
  { choice1: "Know the history of every object you touch", choice2: "Be able to talk to animals" },
  { choice1: "Explore deep space", choice2: "Explore the deep ocean" },
  { choice1: "Never have to sleep again", choice2: "Never have to eat again (but can if you want)" },
  { choice1: "Have a photographic memory", choice2: "Be able to forget anything you want" },
  { choice1: "End world hunger", choice2: "Achieve world peace" },
  { choice1: "Be a famous movie star", choice2: "Be a renowned scientist" },
  { choice1: "Have the ability to teleport", choice2: "Have the ability to read minds" },
];


export default function WouldYouRatherGeneratorPage() {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState<WouldYouRatherQuestion | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getRandomQuestion = () => {
    setIsLoading(true);
    // Simulate a slight delay for better UX
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * predefinedQuestions.length);
      setCurrentQuestion(predefinedQuestions[randomIndex]);
      setIsLoading(false);
    }, 300);
  };

  // Load a question on initial component mount
  useEffect(() => {
    getRandomQuestion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16 flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 font-headline text-3xl">
              <GitCompareArrows size={32} className="text-primary" />
              Would You Rather...
            </CardTitle>
            <CardDescription>
              Ponder these tricky choices. Click below to get a new question!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 min-h-[200px] flex flex-col items-center justify-center">
            {isLoading && !currentQuestion && (
              <div className="flex flex-col items-center text-muted-foreground">
                <RefreshCw size={48} className="animate-spin text-primary mb-4" />
                <p>Getting a question...</p>
              </div>
            )}
            {currentQuestion && (
              <div className="space-y-6 text-center w-full">
                <div className="p-6 bg-primary/10 rounded-lg shadow-md">
                  <p className="text-xl sm:text-2xl font-semibold text-primary-foreground">
                    {isLoading ? "..." : currentQuestion.choice1}
                  </p>
                </div>
                
                <div className="flex items-center justify-center gap-2">
                    <Separator className="w-1/4 bg-border" />
                    <p className="text-lg font-bold text-muted-foreground">OR</p>
                    <Separator className="w-1/4 bg-border" />
                </div>

                <div className="p-6 bg-accent/10 rounded-lg shadow-md">
                  <p className="text-xl sm:text-2xl font-semibold text-accent-foreground">
                     {isLoading ? "..." : currentQuestion.choice2}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-8">
            <Button onClick={getRandomQuestion} size="lg" className="w-full text-lg" disabled={isLoading}>
              <RefreshCw size={20} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? "Generating..." : "New Question"}
            </Button>
          </CardFooter>
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
