
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Percent, TrendingUp, Landmark, AlertCircle } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip } from "recharts";


const formSchema = z.object({
  loanAmount: z.coerce.number().positive({ message: "Loan amount must be positive." }).min(1, "Loan amount is required."),
  annualInterestRate: z.coerce.number().min(0, "Interest rate cannot be negative.").max(100, "Interest rate seems too high (max 100%)."),
  loanTenureYears: z.coerce.number().positive({ message: "Loan tenure must be positive." }).min(0.1, "Loan tenure must be at least 0.1 years.").max(50, "Loan tenure seems too long (max 50 years)."),
});

type FormData = z.infer<typeof formSchema>;

interface EmiResult {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  principal: number;
}

export default function LoanEmiCalculatorPage() {
  const [emiResult, setEmiResult] = useState<EmiResult | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loanAmount: undefined,
      annualInterestRate: undefined,
      loanTenureYears: undefined,
    },
  });

  const onSubmit = (data: FormData) => {
    const principal = data.loanAmount;
    const annualRate = data.annualInterestRate / 100;
    const monthlyRate = annualRate / 12;
    const numberOfMonths = data.loanTenureYears * 12;

    if (monthlyRate === 0) { // Handle zero interest rate
      const emi = principal / numberOfMonths;
      setEmiResult({
        emi: emi,
        totalInterest: 0,
        totalPayment: principal,
        principal: principal,
      });
      return;
    }

    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) /
      (Math.pow(1 + monthlyRate, numberOfMonths) - 1);

    const totalPayment = emi * numberOfMonths;
    const totalInterest = totalPayment - principal;

    if (isNaN(emi) || !isFinite(emi)) {
        setEmiResult(null);
        form.setError("root", { type: "manual", message: "Could not calculate EMI. Please check inputs."});
        return;
    }

    setEmiResult({
      emi: emi,
      totalInterest: totalInterest,
      totalPayment: totalPayment,
      principal: principal,
    });
  };

  const chartData = emiResult ? [
    { name: 'Principal', value: emiResult.principal, fill: "hsl(var(--chart-1))" },
    { name: 'Total Interest', value: emiResult.totalInterest, fill: "hsl(var(--chart-2))" },
  ] : [];

  const chartConfig = {
    principal: {
      label: "Principal",
      color: "hsl(var(--chart-1))",
    },
    interest: {
      label: "Interest",
      color: "hsl(var(--chart-2))",
    },
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Percent size={28} className="text-primary" />
              Loan EMI Calculator
            </CardTitle>
            <CardDescription>Calculate your Equated Monthly Installment (EMI) for loans, along with total interest and payment.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="loanAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 100000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="annualInterestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Interest Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 7.5" {...field} step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="loanTenureYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Tenure (Years)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 20" {...field} step="0.1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {form.formState.errors.root && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Calculation Error</AlertTitle>
                    <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full sm:w-auto">
                  <TrendingUp size={18} className="mr-2" />
                  Calculate EMI
                </Button>
              </form>
            </Form>

            {emiResult && (
              <div className="mt-8 space-y-6 p-6 bg-muted/30 rounded-lg border">
                <h3 className="text-2xl font-semibold text-center text-primary font-headline">Loan EMI Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-card rounded-md shadow-sm">
                            <span className="text-muted-foreground">Monthly EMI:</span>
                            <span className="font-bold text-lg text-primary">{formatCurrency(emiResult.emi)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-card rounded-md shadow-sm">
                            <span className="text-muted-foreground">Total Principal:</span>
                            <span className="font-semibold">{formatCurrency(emiResult.principal)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-card rounded-md shadow-sm">
                            <span className="text-muted-foreground">Total Interest Payable:</span>
                            <span className="font-semibold">{formatCurrency(emiResult.totalInterest)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-card rounded-md shadow-sm border-t border-primary/50 mt-2 pt-3">
                            <span className="text-muted-foreground font-bold">Total Payment:</span>
                            <span className="font-bold text-xl">{formatCurrency(emiResult.totalPayment)}</span>
                        </div>
                    </div>

                    {chartData.length > 0 && (emiResult.principal > 0 || emiResult.totalInterest > 0) && (
                       <div className="h-[250px] w-full">
                         <ChartContainer config={chartConfig} className="w-full h-full">
                           <PieChart>
                             <ChartTooltip
                               cursor={false}
                               content={<ChartTooltipContent hideLabel />}
                             />
                             <Pie
                               data={chartData}
                               dataKey="value"
                               nameKey="name"
                               cx="50%"
                               cy="50%"
                               outerRadius={100}
                               innerRadius={60}
                               labelLine={false}
                               label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                  const RADIAN = Math.PI / 180;
                                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                  const x  = cx + radius * Math.cos(-midAngle * RADIAN);
                                  const y = cy  + radius * Math.sin(-midAngle * RADIAN);
                                  return (
                                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs fill-foreground">
                                      {`${chartData[index].name} (${(percent * 100).toFixed(0)}%)`}
                                    </text>
                                  );
                                }}
                             >
                               {chartData.map((entry) => (
                                 <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                               ))}
                             </Pie>
                              <RechartsTooltip 
                                contentStyle={{
                                  background: 'hsl(var(--background))',
                                  borderColor: 'hsl(var(--border))',
                                  borderRadius: 'var(--radius)',
                                }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                              />
                           </PieChart>
                         </ChartContainer>
                       </div>
                    )}
                </div>


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

