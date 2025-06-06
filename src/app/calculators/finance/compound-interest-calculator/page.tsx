
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TrendingUp, Landmark, Wallet, BarChartHorizontalBig, AlertCircle } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";

const compoundingFrequencyOptions = [
  { label: 'Annually', value: 'annually' },
  { label: 'Semi-Annually', value: 'semiannually' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Daily', value: 'daily' },
] as const;

type CompoundingFrequency = typeof compoundingFrequencyOptions[number]['value'];

const formSchema = z.object({
  principalAmount: z.coerce.number().positive({ message: "Principal amount must be positive." }).min(1, "Principal amount is required."),
  annualInterestRate: z.coerce.number().min(0, "Interest rate cannot be negative.").max(100, "Interest rate seems too high (max 100%)."),
  investmentTenureYears: z.coerce.number().positive({ message: "Tenure must be positive." }).min(0.1, "Tenure must be at least 0.1 years.").max(70, "Tenure seems too long (max 70 years)."),
  compoundingFrequency: z.enum(compoundingFrequencyOptions.map(opt => opt.value) as [CompoundingFrequency, ...CompoundingFrequency[]], {
    required_error: "Compounding frequency is required.",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface CompoundInterestResult {
  maturityValue: number;
  totalInterest: number;
  principalAmount: number;
}

interface ChartDataPoint {
  year: number;
  value: number;
}

const compoundingFrequencyMap: Record<CompoundingFrequency, number> = {
  annually: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

export default function CompoundInterestCalculatorPage() {
  const [result, setResult] = useState<CompoundInterestResult | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      principalAmount: undefined,
      annualInterestRate: undefined,
      investmentTenureYears: undefined,
      compoundingFrequency: 'annually',
    },
  });

  const onSubmit = (data: FormData) => {
    const P = data.principalAmount;
    const r = data.annualInterestRate / 100; // Annual rate in decimal
    const t = data.investmentTenureYears;
    const n = compoundingFrequencyMap[data.compoundingFrequency];

    const maturityValue = P * Math.pow((1 + r / n), n * t);
    const totalInterest = maturityValue - P;

    if (isNaN(maturityValue) || !isFinite(maturityValue)) {
        setResult(null);
        setChartData([]);
        form.setError("root", { type: "manual", message: "Could not calculate. Please check inputs."});
        return;
    }

    setResult({
      maturityValue,
      totalInterest,
      principalAmount: P,
    });

    // Generate chart data
    const newChartData: ChartDataPoint[] = [];
    for (let year = 0; year <= t; year++) {
      const valueAtYear = P * Math.pow((1 + r / n), n * year);
      newChartData.push({ year: year, value: parseFloat(valueAtYear.toFixed(2)) });
    }
    setChartData(newChartData);
  };
  
  const chartConfig = {
    investmentValue: {
      label: "Investment Value",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;


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
              <TrendingUp size={28} className="text-primary" />
              Compound Interest Calculator
            </CardTitle>
            <CardDescription>Calculate the future value of your investment with compound interest and visualize its growth.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="principalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Principal Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 10000" {...field} />
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
                        <Input type="number" placeholder="e.g., 5" {...field} step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="investmentTenureYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Tenure (Years)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 10" {...field} step="0.1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="compoundingFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compounding Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {compoundingFrequencyOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                  <BarChartHorizontalBig size={18} className="mr-2" />
                  Calculate
                </Button>
              </form>
            </Form>

            {result && (
              <div className="mt-8 space-y-6 p-6 bg-muted/30 rounded-lg border">
                <h3 className="text-2xl font-semibold text-center text-primary font-headline">Investment Growth Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
                  <div className="p-4 bg-card rounded-md shadow-sm">
                    <p className="text-sm text-muted-foreground">Principal Amount</p>
                    <p className="text-xl font-semibold">{formatCurrency(result.principalAmount)}</p>
                  </div>
                  <div className="p-4 bg-card rounded-md shadow-sm">
                    <p className="text-sm text-muted-foreground">Total Interest Earned</p>
                    <p className="text-xl font-semibold text-green-500">{formatCurrency(result.totalInterest)}</p>
                  </div>
                  <div className="p-4 bg-card rounded-md shadow-sm">
                    <p className="text-sm text-muted-foreground">Maturity Value</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(result.maturityValue)}</p>
                  </div>
                </div>

                {chartData.length > 1 && (
                   <div className="mt-8">
                     <h4 className="text-lg font-semibold text-center mb-4">Investment Growth Over Time</h4>
                     <div className="h-[300px] w-full">
                       <ChartContainer config={chartConfig} className="w-full h-full">
                         <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                           <XAxis 
                             dataKey="year" 
                             tickFormatter={(value) => `Year ${value}`}
                             stroke="hsl(var(--muted-foreground))"
                             tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                           />
                           <YAxis 
                             tickFormatter={(value) => formatCurrency(value)}
                             stroke="hsl(var(--muted-foreground))"
                             tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                             domain={['auto', 'auto']}
                           />
                           <ChartTooltip
                             cursor={{ strokeDasharray: '3 3', stroke: 'hsl(var(--primary))' }}
                             content={<ChartTooltipContent 
                                formatter={(value, name, props) => [formatCurrency(value as number), chartConfig[props.dataKey as keyof typeof chartConfig]?.label || props.dataKey ]} 
                                labelFormatter={(label) => `Year ${label}`}
                              />}
                           />
                           <Legend content={({ payload }) => {
                                return (
                                  <ul className="flex justify-center gap-4 mt-4">
                                    {payload?.map((entry, index) => (
                                      <li key={`item-${index}`} className="flex items-center gap-2 text-sm">
                                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                        {chartConfig[entry.dataKey as keyof typeof chartConfig]?.label || entry.dataKey}
                                      </li>
                                    ))}
                                  </ul>
                                )
                              }}
                           />
                           <Line 
                             type="monotone" 
                             dataKey="value" 
                             stroke={chartConfig.investmentValue.color}
                             strokeWidth={2} 
                             dot={{ r: 4, fill: chartConfig.investmentValue.color, stroke: "hsl(var(--background))", strokeWidth: 2 }}
                             activeDot={{ r: 6, fill: chartConfig.investmentValue.color, stroke: "hsl(var(--background))", strokeWidth: 2 }}
                             name={chartConfig.investmentValue.label as string}
                            />
                         </LineChart>
                       </ChartContainer>
                     </div>
                   </div>
                )}
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

