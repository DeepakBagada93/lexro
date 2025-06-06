
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, AlertTriangle, Percent, Landmark } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const supportedCountries = [
  { value: 'in', label: 'India' },
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
] as const;

type CountryCode = typeof supportedCountries[number]['value'];

const currentYear = new Date().getFullYear();
const taxYears = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

const formSchema = z.object({
  grossAnnualIncome: z.coerce.number().positive({ message: "Income must be a positive number." }).min(1, "Income is required."),
  country: z.enum(supportedCountries.map(c => c.value) as [CountryCode, ...CountryCode[]], {
    required_error: "Country is required.",
  }),
  taxYear: z.string().min(4, "Tax year is required."),
  // Optional fields for India GST
  gstTaxableTurnover: z.coerce.number().optional(),
  gstAverageRate: z.coerce.number().min(0).max(100).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface TaxResult {
  estimatedIncomeTax: string;
  estimatedGstPayable?: string;
  country: CountryCode;
  income: number;
}

export default function IncomeTaxCalculatorPage() {
  const [taxResult, setTaxResult] = useState<TaxResult | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | undefined>(undefined);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grossAnnualIncome: undefined,
      country: undefined,
      taxYear: currentYear.toString(),
      gstTaxableTurnover: undefined,
      gstAverageRate: undefined,
    },
  });

  const onSubmit = (data: FormData) => {
    // Mock calculation
    const income = data.grossAnnualIncome;
    let estimatedIncomeTaxValue = income * 0.15; // Generic mock tax rate
    let estimatedGstPayableValue;

    if (data.country === 'in') {
      estimatedIncomeTaxValue = income * 0.20; // India-specific mock rate
      if (data.gstTaxableTurnover && data.gstAverageRate) {
        estimatedGstPayableValue = data.gstTaxableTurnover * (data.gstAverageRate / 100);
      }
    } else if (data.country === 'us') {
      estimatedIncomeTaxValue = income * 0.18; // US-specific mock rate
    }

    setTaxResult({
      estimatedIncomeTax: formatCurrency(estimatedIncomeTaxValue, data.country),
      estimatedGstPayable: estimatedGstPayableValue ? formatCurrency(estimatedGstPayableValue, data.country) : undefined,
      country: data.country,
      income: data.grossAnnualIncome,
    });
  };
  
  const getCurrencySymbol = (countryCode: CountryCode | undefined) => {
    switch (countryCode) {
      case 'in': return '₹';
      case 'us': return '$';
      case 'gb': return '£';
      case 'ca': return 'CA$';
      default: return '$';
    }
  };

  const formatCurrency = (amount: number, countryCode: CountryCode | undefined) => {
    const symbol = getCurrencySymbol(countryCode);
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const handleCountryChange = (value: CountryCode) => {
    setSelectedCountry(value);
    form.setValue('country', value);
    if (value !== 'in') {
        form.resetField('gstTaxableTurnover');
        form.resetField('gstAverageRate');
    }
    setTaxResult(null); // Clear previous results
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <FileText size={28} className="text-primary" />
              Income Tax Calculator
            </CardTitle>
            <CardDescription>Estimate your income tax based on your country and income. Includes a conceptual GST estimation for India.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Disclaimer</AlertTitle>
              <AlertDescription>
                This is a simplified tool for illustrative purposes only. Tax laws are complex and vary by jurisdiction and individual circumstances. Always consult with a qualified tax professional or refer to official government resources for accurate calculations and financial advice.
              </AlertDescription>
            </Alert>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="grossAnnualIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gross Annual Income</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 50000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country of Residence</FormLabel>
                      <Select onValueChange={(value: CountryCode) => handleCountryChange(value)} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {supportedCountries.map(country => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tax year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {taxYears.map(year => (
                            <SelectItem key={year} value={year}>
                              {year}-{parseInt(year)+1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedCountry === 'in' && (
                  <div className="p-4 border border-dashed rounded-lg space-y-4 bg-muted/30">
                    <h3 className="text-lg font-semibold text-primary font-headline flex items-center gap-2">
                      <Landmark size={20} /> GST Estimation (Optional for India)
                    </h3>
                     <p className="text-xs text-muted-foreground">This is a conceptual estimation and not a precise GST calculation.</p>
                    <FormField
                      control={form.control}
                      name="gstTaxableTurnover"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Taxable Turnover (for GST)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 2000000" {...field} onChange={e => field.onChange(e.target.valueAsNumber || undefined)} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gstAverageRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assumed Average GST Rate (%)</FormLabel>
                          <FormControl>
                             <Input type="number" placeholder="e.g., 18" {...field} onChange={e => field.onChange(e.target.valueAsNumber || undefined)} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <Button type="submit" className="w-full sm:w-auto">
                  <Percent size={18} className="mr-2" />
                  Estimate Tax (Mock)
                </Button>
              </form>
            </Form>

            {taxResult && (
              <div className="mt-8 space-y-4 p-6 bg-muted/30 rounded-lg border">
                <h3 className="text-2xl font-semibold text-center text-primary font-headline">Mock Tax Estimation Results</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-card rounded-md shadow-sm">
                    <span className="text-muted-foreground">Gross Annual Income:</span>
                    <span className="font-semibold">{formatCurrency(taxResult.income, taxResult.country)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-card rounded-md shadow-sm">
                    <span className="text-muted-foreground">Estimated Income Tax:</span>
                    <span className="font-bold text-lg text-primary">{taxResult.estimatedIncomeTax}</span>
                  </div>
                  {taxResult.estimatedGstPayable && (
                    <div className="flex justify-between items-center p-3 bg-card rounded-md shadow-sm">
                      <span className="text-muted-foreground">Estimated GST Payable (India):</span>
                      <span className="font-semibold">{taxResult.estimatedGstPayable}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-center text-muted-foreground pt-2">
                  Remember, this is a simplified mock calculation. Consult a tax professional for accurate advice.
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

    