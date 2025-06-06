
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Clock, DollarSign, Percent, TrendingUp, AlertCircle } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  desiredAnnualIncome: z.coerce.number().positive({ message: "Desired income must be positive." }).min(1000, "Minimum desired income is $1,000."),
  annualBusinessExpenses: z.coerce.number().min(0, "Business expenses cannot be negative.").default(0),
  annualPersonalBenefits: z.coerce.number().min(0, "Personal benefits cost cannot be negative.").default(0),
  hoursPerWorkWeek: z.coerce.number().min(1, "Must work at least 1 hour per week.").max(100, "Working over 100 hours/week seems high.").default(40),
  vacationWeeksPerYear: z.coerce.number().min(0, "Vacation weeks cannot be negative.").max(51, "Cannot take more than 51 vacation weeks.").default(4),
  billableHoursPercentage: z.coerce.number().min(10, "Billable percentage must be at least 10%.").max(100, "Billable percentage cannot exceed 100%.").default(70),
  profitMarginPercentage: z.coerce.number().min(0, "Profit margin cannot be negative.").max(100, "Profit margin cannot exceed 100%.").default(15),
});

type FormData = z.infer<typeof formSchema>;

interface RateResult {
  finalHourlyRate: number;
  baseHourlyRate: number;
  totalBillableHoursPerYear: number;
  totalAnnualRevenueNeeded: number;
}

export default function FreelancerHourlyRateCalculatorPage() {
  const [result, setResult] = useState<RateResult | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      desiredAnnualIncome: 50000,
      annualBusinessExpenses: 5000,
      annualPersonalBenefits: 6000,
      hoursPerWorkWeek: 40,
      vacationWeeksPerYear: 4,
      billableHoursPercentage: 70,
      profitMarginPercentage: 15,
    },
  });

  const onSubmit = (data: FormData) => {
    const totalAnnualRevenueNeeded = data.desiredAnnualIncome + data.annualBusinessExpenses + data.annualPersonalBenefits;
    const workingWeeksPerYear = 52 - data.vacationWeeksPerYear;
    
    if (workingWeeksPerYear <= 0) {
      form.setError("vacationWeeksPerYear", { type: "manual", message: "Working weeks must be positive." });
      setResult(null);
      return;
    }

    const totalWorkHoursPerYear = workingWeeksPerYear * data.hoursPerWorkWeek;
    const totalBillableHoursPerYear = totalWorkHoursPerYear * (data.billableHoursPercentage / 100);

    if (totalBillableHoursPerYear <= 0) {
       form.setError("billableHoursPercentage", {type: "manual", message: "Total billable hours must be greater than zero. Adjust billable % or work hours/weeks."});
       setResult(null);
       return;
    }

    const baseHourlyRate = totalAnnualRevenueNeeded / totalBillableHoursPerYear;
    const finalHourlyRate = baseHourlyRate * (1 + (data.profitMarginPercentage / 100));

    if (isNaN(finalHourlyRate) || !isFinite(finalHourlyRate)) {
        setResult(null);
        form.setError("root", { type: "manual", message: "Could not calculate rate. Please check all inputs."});
        return;
    }

    setResult({
      finalHourlyRate,
      baseHourlyRate,
      totalBillableHoursPerYear,
      totalAnnualRevenueNeeded,
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Clock size={28} className="text-primary" />
              Freelancer Hourly Rate Calculator
            </CardTitle>
            <CardDescription>Determine your ideal hourly rate by factoring in income goals, expenses, and billable time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="desiredAnnualIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><DollarSign size={16} className="mr-1 text-primary/80" />Desired Annual Income ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 60000" {...field} />
                        </FormControl>
                        <FormDescription>Your target pre-tax annual earnings.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="annualBusinessExpenses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><DollarSign size={16} className="mr-1 text-primary/80" />Annual Business Expenses ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 5000" {...field} />
                        </FormControl>
                        <FormDescription>Software, hardware, marketing, etc.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="annualPersonalBenefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><DollarSign size={16} className="mr-1 text-primary/80" />Annual Personal Benefits ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 7000" {...field} />
                      </FormControl>
                      <FormDescription>Health insurance, retirement, paid leave allowance.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="hoursPerWorkWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Clock size={16} className="mr-1 text-primary/80" />Hours Per Work Week</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 40" {...field} />
                        </FormControl>
                         <FormDescription>Total hours you plan to work weekly.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vacationWeeksPerYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Clock size={16} className="mr-1 text-primary/80" />Vacation Weeks Per Year</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 4" {...field} />
                        </FormControl>
                        <FormDescription>Weeks you won't be working.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="billableHoursPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Percent size={16} className="mr-1 text-primary/80" />Billable Hours (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 70" {...field} min="0" max="100" />
                        </FormControl>
                        <FormDescription>Percent of work time spent on client projects.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="profitMarginPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Percent size={16} className="mr-1 text-primary/80" />Profit Margin / Buffer (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 15" {...field} min="0" max="100" />
                        </FormControl>
                        <FormDescription>Markup for profit, reinvestment, etc.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {form.formState.errors.root && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Calculation Error</AlertTitle>
                    <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full sm:w-auto">
                  <TrendingUp size={18} className="mr-2" />
                  Calculate Hourly Rate
                </Button>
              </form>
            </Form>

            {result && (
              <div className="mt-8 space-y-6 p-6 bg-muted/30 rounded-lg border">
                <h3 className="text-2xl font-semibold text-center text-primary font-headline">Your Estimated Hourly Rate</h3>
                
                <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">Suggested Hourly Rate (incl. Profit Margin)</p>
                    <p className="text-4xl font-bold text-primary">{formatCurrency(result.finalHourlyRate)}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
                    <div className="p-3 bg-card rounded-md shadow-sm">
                        <p className="text-xs text-muted-foreground">Base Hourly Rate</p>
                        <p className="text-lg font-semibold">{formatCurrency(result.baseHourlyRate)}</p>
                    </div>
                    <div className="p-3 bg-card rounded-md shadow-sm">
                        <p className="text-xs text-muted-foreground">Total Billable Hours/Year</p>
                        <p className="text-lg font-semibold">{result.totalBillableHoursPerYear.toFixed(0)} hours</p>
                    </div>
                    <div className="p-3 bg-card rounded-md shadow-sm">
                        <p className="text-xs text-muted-foreground">Total Annual Revenue Needed</p>
                        <p className="text-lg font-semibold">{formatCurrency(result.totalAnnualRevenueNeeded)}</p>
                    </div>
                </div>
                 <p className="text-xs text-center text-muted-foreground pt-2">
                  This is an estimate. Adjust inputs based on your specific situation and market conditions.
                </p>
              </div>
            )}
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

