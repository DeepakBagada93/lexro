
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserCog, Sparkles, AlertTriangle, Type, Briefcase, Target, Zap, Info, Users, GraduationCap, MapPin, MessagesSquare, RadioTower, FileText, MessageSquareQuote } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import {
  generateCustomerPersona,
  type GenerateCustomerPersonaInput,
  type GenerateCustomerPersonaOutput
} from '@/ai/flows/generate-customer-persona-flow';

// Define the input schema here for client-side validation
const GenerateCustomerPersonaInputSchema = z.object({
  businessType: z.string().min(3, "Business type is required (min 3 characters).").describe("Type of business (e.g., e-commerce, SaaS, local coffee shop, B2B software)."),
  productOrService: z.string().min(10, "Product/service description is required (min 10 characters).").describe("Brief description of the main product or service offered by the business."),
  targetAudienceGoals: z.string().min(10, "Audience goals are required (min 10 characters).").describe("What does the ideal customer want to achieve by using this product/service or in general? (e.g., 'increase productivity', 'find unique gifts', 'improve health')."),
  targetAudienceChallenges: z.string().min(10, "Audience challenges are required (min 10 characters).").describe("Key problems, pain points, or frustrations the ideal customer faces that this product/service can address (e.g., 'wasting time on manual tasks', 'difficulty finding reliable information', 'high costs of current solutions')."),
  additionalInfo: z.string().optional().describe("Any other relevant information about the target audience, market context, or specific aspects to focus on (e.g., 'they are budget-conscious', 'primarily active on Instagram', 'value sustainability')."),
});


export default function CustomerPersonaGeneratorPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [personaResult, setPersonaResult] = useState<GenerateCustomerPersonaOutput | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const form = useForm<GenerateCustomerPersonaInput>({
    resolver: zodResolver(GenerateCustomerPersonaInputSchema),
    defaultValues: {
      businessType: "",
      productOrService: "",
      targetAudienceGoals: "",
      targetAudienceChallenges: "",
      additionalInfo: "",
    },
  });

  const onSubmit = async (data: GenerateCustomerPersonaInput) => {
    setIsLoading(true);
    setPersonaResult(null);
    setAiError(null);
    try {
      const result = await generateCustomerPersona(data);
      setPersonaResult(result);
      toast({ title: "Persona Generated Successfully!", description: "Scroll down to see your customer persona." });
    } catch (error: any) {
      console.error("Error generating persona:", error);
      const errorMessage = error.message || "An unexpected error occurred while generating the persona.";
      setAiError(errorMessage);
      toast({
        title: "Persona Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-3xl">
              <UserCog size={32} className="text-primary" />
              AI Customer Persona Generator
            </CardTitle>
            <CardDescription>
              Describe your business and target audience, and let AI help you craft a detailed customer persona.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
              <CardContent className="space-y-6 pt-6">
                <Alert variant="default">
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>How it Works</AlertTitle>
                  <AlertDescription>
                    Provide details about your business and ideal customer. Our AI will analyze this information to generate a persona, including demographics, goals, challenges, and more.
                  </AlertDescription>
                </Alert>

                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><Briefcase size={16}/> Business Type / Industry</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., E-commerce store, SaaS platform, Local bakery" {...field} />
                      </FormControl>
                      <FormDescription>What kind of business do you run?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productOrService"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><Type size={16}/> Product or Service Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Briefly describe your main offering. e.g., 'Handcrafted leather goods for professionals', 'AI-powered project management software'" {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAudienceGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><Target size={16}/> Target Audience's Goals</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What does your ideal customer want to achieve? e.g., 'Improve their productivity', 'Find unique, high-quality products', 'Solve a specific problem efficiently'" {...field} rows={3}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAudienceChallenges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><Zap size={16}/> Target Audience's Challenges/Pain Points</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What problems or frustrations do they face? e.g., 'Current solutions are too expensive or complex', 'Lack of time to research options', 'Difficulty finding reliable services'" {...field} rows={3}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1"><Info size={16}/> Additional Information (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any other relevant details? e.g., 'They are early adopters of technology', 'Primarily use mobile devices', 'Prefer eco-friendly brands'" {...field} rows={3}/>
                      </FormControl>
                       <FormDescription>Specific demographics, behaviors, or market context.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="pt-6 border-t">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  <Sparkles size={18} className="mr-2" />
                  {isLoading ? 'Generating Persona...' : 'Generate Persona with AI'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {isLoading && (
          <div className="mt-8 flex flex-col items-center justify-center text-muted-foreground">
            <svg className="animate-spin h-8 w-8 text-primary mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>AI is crafting your persona... This might take a moment.</p>
          </div>
        )}

        {aiError && !isLoading && (
          <Alert variant="destructive" className="mt-8 max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Persona Generation Error</AlertTitle>
            <AlertDescription>{aiError}</AlertDescription>
          </Alert>
        )}

        {personaResult && !isLoading && !aiError && (
          <Card className="mt-10 max-w-2xl mx-auto shadow-2xl bg-card/90">
            <CardHeader className="bg-primary/10">
              <CardTitle className="text-3xl font-headline text-primary text-center">{personaResult.personaName}</CardTitle>
              {personaResult.quote && (
                <blockquote className="text-center text-muted-foreground italic mt-2 border-l-4 border-primary/50 pl-4 py-1">
                  <MessageSquareQuote size={18} className="inline-block mr-2 opacity-70 transform -scale-x-100" />
                  {personaResult.quote}
                   <MessageSquareQuote size={18} className="inline-block ml-2 opacity-70" />
                </blockquote>
              )}
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <section>
                <h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2"><Users size={20}/>Demographics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <p><strong className="font-medium">Age Range:</strong> {personaResult.demographics.ageRange}</p>
                  <p><strong className="font-medium">Occupation:</strong> {personaResult.demographics.occupation}</p>
                  {personaResult.demographics.educationLevel && <p><strong className="font-medium">Education:</strong> {personaResult.demographics.educationLevel}</p>}
                  {personaResult.demographics.location && <p><strong className="font-medium">Location:</strong> {personaResult.demographics.location}</p>}
                </div>
                {personaResult.demographics.keyCharacteristics && personaResult.demographics.keyCharacteristics.length > 0 && (
                    <div className="mt-2">
                        <p className="font-medium text-sm">Key Characteristics:</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground pl-1">
                            {personaResult.demographics.keyCharacteristics.map((char, idx) => <li key={`char-${idx}`}>{char}</li>)}
                        </ul>
                    </div>
                )}
              </section>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section>
                  <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2"><Target size={18}/>Goals</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {personaResult.goals.map((goal, index) => <li key={`goal-${index}`}>{goal}</li>)}
                  </ul>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2"><Zap size={18}/>Challenges</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {personaResult.challenges.map((challenge, index) => <li key={`challenge-${index}`}>{challenge}</li>)}
                  </ul>
                </section>
              </div>
               <Separator />
                <section>
                  <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2"><Sparkles size={18}/>Motivations</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {personaResult.motivations.map((motivation, index) => <li key={`motivation-${index}`}>{motivation}</li>)}
                  </ul>
                </section>
              <Separator />
              <section>
                <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2"><Briefcase size={18}/>How Product/Service Helps</h3>
                <p className="text-sm text-muted-foreground">{personaResult.howProductHelps}</p>
              </section>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <section>
                  <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2"><RadioTower size={18}/>Marketing Channels</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {personaResult.marketingChannels.map((channel, index) => <li key={`channel-${index}`}>{channel}</li>)}
                  </ul>
                </section>
                <section>
                  <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2"><FileText size={18}/>Preferred Content</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {personaResult.preferredContent.map((content, index) => <li key={`content-${index}`}>{content}</li>)}
                  </ul>
                </section>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
                <p className="text-xs text-muted-foreground">This persona was generated by AI. Review and refine it based on your actual customer research.</p>
            </CardFooter>
          </Card>
        )}

      </main>
      <footer className="text-center py-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Lexro AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

