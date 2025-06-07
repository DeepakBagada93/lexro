
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tag, DollarSign, Percent, TrendingUp, AlertCircle, Info } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const pricingSchema = z.object({
  costPrice: z.coerce.number().positive({ message: "Cost price must be positive." }).min(0.01, "Cost price must be at least $0.01."),
  sellingPrice: z.coerce.number().positive({ message: "Selling price must be positive." }).min(0.01, "Selling price must be at least $0.01."),
  otherCostsPerUnit: z.coerce.number().min(0, "Other costs cannot be negative.").optional().default(0),
});

type PricingFormData = z.infer<typeof pricingSchema>;

interface PricingResult {
  totalCostPerUnit: number;
  profitPerUnit: number;
  profitMargin: number; // Percentage
  markupAmount: number;
  markupPercentage: number; // Percentage
}

export default function ProductPricingCalculatorPage() {
  const [result, setResult] = useState<PricingResult | null>(null);

  const form = useForm<PricingFormData>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      costPrice: undefined,
      sellingPrice: undefined,
      otherCostsPerUnit: 0,
    },
  });

  const onSubmit = (data: PricingFormData) => {
    const totalCostPerUnit = data.costPrice + (data.otherCostsPerUnit || 0);
    const profitPerUnit = data.sellingPrice - totalCostPerUnit;
    
    let profitMargin = 0;
    if (data.sellingPrice > 0) {
      profitMargin = (profitPerUnit / data.sellingPrice) * 100;
    }

    const markupAmount = data.sellingPrice - data.costPrice;
    
    let markupPercentage = 0;
    if (data.costPrice > 0) {
      markupPercentage = (markupAmount / data.costPrice) * 100;
    }
    
    if (data.sellingPrice < totalCostPerUnit) {
        form.setError("sellingPrice", { type: "manual", message: `Selling price ($${data.sellingPrice.toFixed(2)}) is less than total cost per unit ($${totalCostPerUnit.toFixed(2)}), resulting in a loss.`})
    } else {
        form.clearErrors("sellingPrice");
    }


    setResult({
      totalCostPerUnit: parseFloat(totalCostPerUnit.toFixed(2)),
      profitPerUnit: parseFloat(profitPerUnit.toFixed(2)),
      profitMargin: parseFloat(profitMargin.toFixed(2)),
      markupAmount: parseFloat(markupAmount.toFixed(2)),
      markupPercentage: parseFloat(markupPercentage.toFixed(2)),
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-lg mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Tag size={28} className="text-primary" />
              Product Pricing Calculator
            </CardTitle>
            <CardDescription>Calculate profit margin, markup, and other key pricing metrics for your products.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><DollarSign size={16} className="mr-1 text-primary/80" />Cost Price (per unit)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 10.50" {...field} step="0.01" />
                      </FormControl>
                      <FormDescription>The direct cost to acquire or produce one item.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sellingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><DollarSign size={16} className="mr-1 text-primary/80" />Selling Price (per unit)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 25.00" {...field} step="0.01" />
                      </FormControl>
                      <FormDescription>The price you sell one item for.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="otherCostsPerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><DollarSign size={16} className="mr-1 text-primary/80" />Other Costs (per unit, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 2.00" {...field} step="0.01" />
                      </FormControl>
                      <FormDescription>Additional costs like shipping, packaging, or marketing per unit.</FormDescription>
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
                  Calculate Pricing Metrics
                </Button>
              </form>
            </Form>

            {result && (
              <div className="mt-8 space-y-4 p-6 bg-muted/30 rounded-lg border">
                <h3 className="text-xl font-semibold text-center text-primary font-headline mb-4">Pricing Analysis</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-card rounded-md shadow-sm">
                    <span className="text-sm text-muted-foreground">Total Cost Per Unit:</span>
                    <span className="font-medium">{formatCurrency(result.totalCostPerUnit)}</span>
                  </div>
                   <div className="flex justify-between p-2 bg-card rounded-md shadow-sm">
                    <span className="text-sm text-muted-foreground">Profit Per Unit:</span>
                    <span className={`font-medium ${result.profitPerUnit < 0 ? 'text-destructive' : 'text-green-500'}`}>{formatCurrency(result.profitPerUnit)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-card rounded-md shadow-sm">
                    <span className="text-sm text-muted-foreground">Profit Margin:</span>
                    <span className={`font-medium ${result.profitMargin < 0 ? 'text-destructive' : 'text-green-500'}`}>{result.profitMargin.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between p-2 bg-card rounded-md shadow-sm">
                    <span className="text-sm text-muted-foreground">Markup Amount:</span>
                    <span className="font-medium">{formatCurrency(result.markupAmount)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-card rounded-md shadow-sm">
                    <span className="text-sm text-muted-foreground">Markup Percentage:</span>
                    <span className="font-medium">{result.markupPercentage.toFixed(2)}%</span>
                  </div>
                </div>
                {result.profitPerUnit < 0 && (
                     <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Warning: Selling at a Loss</AlertTitle>
                        <AlertDescription>
                            Your selling price is lower than your total cost per unit. Consider adjusting your pricing strategy.
                        </AlertDescription>
                    </Alert>
                )}
              </div>
            )}
             <Alert variant="default" className="mt-6">
              <Info className="h-4 w-4" />
              <AlertTitle>Note on Calculations</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>Profit Margin</strong> is (Profit / Selling Price) * 100.</li>
                  <li><strong>Markup Percentage</strong> is (Markup Amount / Cost Price) * 100.</li>
                  <li>These are simplified calculations. Real-world pricing strategy may involve more complex factors like fixed overheads, market demand, and competitor pricing.</li>
                </ul>
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

