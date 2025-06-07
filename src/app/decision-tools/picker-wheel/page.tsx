
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Disc3, PlusCircle, Trash2, PlayCircle, RotateCcw, CheckCircle, Target, RefreshCw } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const choiceSchema = z.object({
  value: z.string().min(1, "Choice cannot be empty.").max(100, "Choice too long (max 100 chars)."),
});

const pickerWheelSchema = z.object({
  choices: z.array(choiceSchema).min(2, "Please add at least two choices to spin."),
});

type PickerWheelFormData = z.infer<typeof pickerWheelSchema>;

export default function PickerWheelPage() {
  const { toast } = useToast();
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinningItem, setSpinningItem] = useState<string | null>(null);


  const form = useForm<PickerWheelFormData>({
    resolver: zodResolver(pickerWheelSchema),
    defaultValues: {
      choices: [{ value: "" }, { value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "choices",
  });

  const onSubmit = (data: PickerWheelFormData) => {
    if (data.choices.length < 2) {
      toast({ title: "Not Enough Choices", description: "You need at least two choices to spin the wheel.", variant: "destructive" });
      return;
    }

    setIsSpinning(true);
    setSelectedChoice(null);

    const validChoices = data.choices.map(c => c.value).filter(Boolean);
    if (validChoices.length < 2) {
        toast({ title: "Not Enough Valid Choices", description: "Please ensure at least two choices have text.", variant: "destructive"});
        setIsSpinning(false);
        return;
    }

    let spinCount = 0;
    const minSpins = validChoices.length * 2; 
    const randomExtraSpins = Math.floor(Math.random() * validChoices.length * 2);
    const maxSpins = minSpins + randomExtraSpins + 10; 
    const spinInterval = 75; // milliseconds

    const intervalId = setInterval(() => {
      setSpinningItem(validChoices[spinCount % validChoices.length]);
      spinCount++;

      if (spinCount > maxSpins) {
        clearInterval(intervalId);
        const randomIndex = Math.floor(Math.random() * validChoices.length);
        const result = validChoices[randomIndex];
        setSelectedChoice(result);
        setSpinningItem(null);
        setIsSpinning(false);
        toast({ title: "And the winner is...", description: result, duration: 5000 });
      }
    }, spinInterval);
  };
  
  const handleReset = () => {
    form.reset({ choices: [{ value: "" }, { value: "" }] });
    setSelectedChoice(null);
    setIsSpinning(false);
    toast({ title: "Wheel Reset", description: "You can now add new choices."});
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="max-w-xl mx-auto shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-3xl">
                  <Disc3 size={32} className="text-primary" />
                  Picker Wheel
                </CardTitle>
                <CardDescription>
                  Add your choices below, then spin the wheel to get a random decision!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Your Choices:</h3>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 mb-2">
                      <FormField
                        control={form.control}
                        name={`choices.${index}.value`}
                        render={({ field: itemField }) => (
                          <FormItem className="flex-grow">
                            <FormControl>
                              <Input placeholder={`Choice ${index + 1}`} {...itemField} disabled={isSpinning} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {fields.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={isSpinning}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 size={18} />
                        </Button>
                      )}
                    </div>
                  ))}
                   <FormMessage>{form.formState.errors.choices?.message || form.formState.errors.choices?.root?.message}</FormMessage>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ value: "" })}
                    disabled={isSpinning}
                    className="mt-2"
                  >
                    <PlusCircle size={18} className="mr-2" /> Add Choice
                  </Button>
                </div>
                
                <Separator />

                <div className="text-center">
                  <Button type="submit" size="lg" disabled={isSpinning} className="px-8 py-6 text-lg">
                    <PlayCircle size={22} className="mr-2" />
                    {isSpinning ? "Spinning..." : "Spin the Wheel!"}
                  </Button>
                </div>

                {(isSpinning || selectedChoice) && (
                  <div className="mt-8 p-8 bg-primary/10 rounded-xl border-2 border-primary/30 text-center min-h-[150px] flex flex-col items-center justify-center shadow-lg">
                    {isSpinning && (
                      <>
                        <p className="text-sm text-primary/80 mb-2">Spinning...</p>
                        <div className="flex items-center justify-center gap-3">
                          <RefreshCw size={36} className="text-primary animate-spin" />
                          <p className="text-4xl font-bold text-primary truncate max-w-xs">
                          {spinningItem || "Choosing..."}
                          </p>
                        </div>
                      </>
                    )}
                    {!isSpinning && selectedChoice && (
                      <>
                        <p className="text-sm text-primary/80 mb-2">The wheel has decided!</p>
                         <div className="flex items-center justify-center gap-3">
                          <CheckCircle size={40} className="text-accent" />
                          <p className="text-5xl font-bold text-accent truncate max-w-xs">{selectedChoice}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}


              </CardContent>
              <CardFooter className="flex justify-end pt-6 border-t">
                <Button type="button" variant="outline" onClick={handleReset} disabled={isSpinning}>
                   <RotateCcw size={18} className="mr-2" /> Reset Wheel
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </main>
      <footer className="text-center py-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Lexro AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

