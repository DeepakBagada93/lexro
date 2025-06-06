
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Scale, AlertTriangle } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  heightUnit: z.enum(['cm', 'ft_in'], { required_error: "Height unit is required." }),
  heightCm: z.coerce.number().positive({ message: "Height must be positive." }).optional(),
  heightFt: z.coerce.number().min(0, { message: "Feet cannot be negative."}).optional(),
  heightIn: z.coerce.number().min(0, { message: "Inches cannot be negative."}).max(11.99, { message: "Inches must be less than 12."}).optional(),
  weightUnit: z.enum(['kg', 'lbs'], { required_error: "Weight unit is required." }),
  weightKg: z.coerce.number().positive({ message: "Weight must be positive." }).optional(),
  weightLbs: z.coerce.number().positive({ message: "Weight must be positive." }).optional(),
}).superRefine((data, ctx) => {
  if (data.heightUnit === 'cm' && (data.heightCm === undefined || data.heightCm <= 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Height in cm must be a positive number.", path: ['heightCm'] });
  }
  if (data.heightUnit === 'ft_in') {
    const ft = data.heightFt ?? 0;
    const inches = data.heightIn ?? 0;
    if (ft <= 0 && inches <= 0) {
         ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Total height (ft and in) must be positive.", path: ['heightFt'] });
    }
    if (data.heightFt === undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Feet value is required.", path: ['heightFt'] });
    if (data.heightIn === undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Inches value is required.", path: ['heightIn'] });
  }

  if (data.weightUnit === 'kg' && (data.weightKg === undefined || data.weightKg <= 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Weight in kg must be a positive number.", path: ['weightKg'] });
  }
  if (data.weightUnit === 'lbs' && (data.weightLbs === undefined || data.weightLbs <= 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Weight in lbs must be a positive number.", path: ['weightLbs'] });
  }
});

type FormData = z.infer<typeof formSchema>;

interface BmiResult {
  bmi: number;
  category: string;
  color: string;
}

const getBmiCategory = (bmi: number): { category: string; color: string } => {
  if (bmi < 18.5) return { category: "Underweight", color: "text-blue-500" };
  if (bmi < 25) return { category: "Normal weight", color: "text-green-500" };
  if (bmi < 30) return { category: "Overweight", color: "text-yellow-500" };
  return { category: "Obese", color: "text-red-500" };
};

export default function BmiCalculatorPage() {
  const [bmiResult, setBmiResult] = useState<BmiResult | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      heightUnit: 'cm',
      heightCm: undefined,
      heightFt: undefined,
      heightIn: undefined,
      weightUnit: 'kg',
      weightKg: undefined,
      weightLbs: undefined,
    },
  });

  const heightUnit = form.watch('heightUnit');
  const weightUnit = form.watch('weightUnit');

  const onSubmit = (data: FormData) => {
    let heightInMeters: number;
    if (data.heightUnit === 'cm') {
      heightInMeters = (data.heightCm || 0) / 100;
    } else {
      const totalInches = ((data.heightFt || 0) * 12) + (data.heightIn || 0);
      heightInMeters = totalInches * 0.0254;
    }

    let weightInKg: number;
    if (data.weightUnit === 'kg') {
      weightInKg = data.weightKg || 0;
    } else {
      weightInKg = (data.weightLbs || 0) * 0.453592;
    }

    if (heightInMeters <= 0 || weightInKg <= 0) {
      form.setError("root", { type: "manual", message: "Height and weight must be positive values."});
      setBmiResult(null);
      return;
    }

    const bmi = weightInKg / (heightInMeters * heightInMeters);
    if (isNaN(bmi) || !isFinite(bmi)) {
        form.setError("root", { type: "manual", message: "Could not calculate BMI. Please check inputs."});
        setBmiResult(null);
        return;
    }
    const { category, color } = getBmiCategory(bmi);
    setBmiResult({ bmi: parseFloat(bmi.toFixed(1)), category, color });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Scale size={28} className="text-primary" />
              BMI Calculator
            </CardTitle>
            <CardDescription>Calculate your Body Mass Index using metric or imperial units.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="heightUnit"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Height Unit</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.resetField('heightCm');
                            form.resetField('heightFt');
                            form.resetField('heightIn');
                            setBmiResult(null);
                          }}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="cm" /></FormControl>
                            <FormLabel className="font-normal">Centimeters (cm)</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="ft_in" /></FormControl>
                            <FormLabel className="font-normal">Feet & Inches (ft/in)</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {heightUnit === 'cm' && (
                  <FormField
                    control={form.control}
                    name="heightCm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 170" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {heightUnit === 'ft_in' && (
                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="heightFt"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Feet (ft)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 5" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="heightIn"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Inches (in)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 7" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="weightUnit"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Weight Unit</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.resetField('weightKg');
                            form.resetField('weightLbs');
                            setBmiResult(null);
                          }}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="kg" /></FormControl>
                            <FormLabel className="font-normal">Kilograms (kg)</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="lbs" /></FormControl>
                            <FormLabel className="font-normal">Pounds (lbs)</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {weightUnit === 'kg' && (
                  <FormField
                    control={form.control}
                    name="weightKg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 65" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {weightUnit === 'lbs' && (
                  <FormField
                    control={form.control}
                    name="weightLbs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (lbs)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 143" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : +e.target.value)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                 {form.formState.errors.root && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full">Calculate BMI</Button>
              </form>
            </Form>

            {bmiResult && (
              <div className="mt-8 p-6 bg-muted/50 rounded-lg border text-center">
                <h3 className="text-lg font-semibold mb-2 text-primary">Your BMI Result</h3>
                <p className="text-4xl font-bold mb-1">{bmiResult.bmi}</p>
                <p className={`text-xl font-medium ${bmiResult.color}`}>{bmiResult.category}</p>
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>Underweight: &lt; 18.5</p>
                  <p>Normal weight: 18.5 – 24.9</p>
                  <p>Overweight: 25 – 29.9</p>
                  <p>Obese: 30+</p>
                </div>
              </div>
            )}
            <Alert variant="default" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Disclaimer</AlertTitle>
              <AlertDescription>
                BMI is a general screening tool. It does not diagnose body fatness or health of an individual. Consult a healthcare provider for personalized advice.
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


    