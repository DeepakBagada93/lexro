
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Truck, AlertTriangle, Package, MapPin, Shuffle } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const serviceLevels = [
  { value: 'standard', label: 'Standard Ground (5-7 days)' },
  { value: 'express', label: 'Express (2-3 days)' },
  { value: 'overnight', label: 'Overnight (Next day)' },
] as const;

type ServiceLevelValue = typeof serviceLevels[number]['value'];

const shippingSchema = z.object({
  weight: z.coerce.number().positive({ message: "Weight must be a positive number." }),
  weightUnit: z.enum(['kg', 'lbs'], { required_error: "Weight unit is required." }),
  length: z.coerce.number().positive({ message: "Length must be a positive number." }),
  width: z.coerce.number().positive({ message: "Width must be a positive number." }),
  height: z.coerce.number().positive({ message: "Height must be a positive number." }),
  dimensionUnit: z.enum(['cm', 'in'], { required_error: "Dimension unit is required." }),
  originZip: z.string().min(3, "Origin ZIP/Postal code is too short.").max(10, "Origin ZIP/Postal code is too long (max 10 chars)."),
  destinationZip: z.string().min(3, "Destination ZIP/Postal code is too short.").max(10, "Destination ZIP/Postal code is too long (max 10 chars)."),
  serviceLevel: z.enum(serviceLevels.map(sl => sl.value) as [ServiceLevelValue, ...ServiceLevelValue[]], {
    required_error: "Service level is required.",
  }),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

interface ShippingEstimateResult {
  estimatedCost: number;
  currency: string;
  disclaimer: string;
}

// This is a MOCK calculation function. It does NOT reflect real shipping costs.
const mockCalculateShippingCost = (data: ShippingFormData): number => {
  let baseCost = 7.50; // A base fee

  // Weight factor
  const weightInKg = data.weightUnit === 'kg' ? data.weight : data.weight * 0.453592;
  baseCost += weightInKg * 1.25; // $1.25 per kg

  // Dimensional factor (very simplified volumetric weight)
  const lengthCm = data.dimensionUnit === 'cm' ? data.length : data.length * 2.54;
  const widthCm = data.dimensionUnit === 'cm' ? data.width : data.width * 2.54;
  const heightCm = data.dimensionUnit === 'cm' ? data.height : data.height * 2.54;
  const volumeCm3 = lengthCm * widthCm * heightCm;
  baseCost += (volumeCm3 / 10000) * 0.5; // $0.50 per 10,000 cm³ (very arbitrary)

  // Service level multiplier
  if (data.serviceLevel === 'express') {
    baseCost *= 1.8;
  } else if (data.serviceLevel === 'overnight') {
    baseCost *= 3.0;
  }

  // Mock "distance" factor based on a hash of ZIP codes
  // This is extremely crude and just for making the numbers vary a bit
  const originHash = data.originZip.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const destHash = data.destinationZip.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  if (originHash !== destHash) {
      baseCost += Math.abs(originHash - destHash) % 5; // Add $0-$4 based on "difference"
  }


  return parseFloat(baseCost.toFixed(2));
};


export default function ShippingCostEstimatorPage() {
  const [estimateResult, setEstimateResult] = useState<ShippingEstimateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      weight: undefined,
      weightUnit: 'kg',
      length: undefined,
      width: undefined,
      height: undefined,
      dimensionUnit: 'cm',
      originZip: "",
      destinationZip: "",
      serviceLevel: 'standard',
    },
  });
  
  const weightUnit = form.watch('weightUnit');
  const dimensionUnit = form.watch('dimensionUnit');


  const onSubmit = (data: ShippingFormData) => {
    setIsLoading(true);
    setEstimateResult(null);

    // Simulate API call or complex calculation
    setTimeout(() => {
      const cost = mockCalculateShippingCost(data);
      setEstimateResult({
        estimatedCost: cost,
        currency: 'USD', // Assuming USD for this mock
        disclaimer: "This is a mock estimate for demonstration purposes only. Actual shipping costs vary greatly based on carrier, exact locations, package specifics, and current rates. Do not use for real financial decisions.",
      });
      setIsLoading(false);
      toast({ title: "Estimate Generated", description: "A mock shipping cost has been estimated." });
    }, 1000);
  };
  
  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Truck size={28} className="text-primary" />
              Shipping Cost Estimator (Mock)
            </CardTitle>
            <CardDescription>Enter package details to get a *mock* shipping cost estimate. Not for real use.</CardDescription>
          </CardHeader>
          <CardContent>
             <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important: Mock Estimator</AlertTitle>
              <AlertDescription>
                The costs generated by this tool are **for demonstration purposes only** and do NOT reflect actual shipping rates. Always use official carrier tools for real quotes.
              </AlertDescription>
            </Alert>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <section className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <h3 className="text-lg font-semibold text-primary/90 flex items-center gap-2"><Package size={20}/>Package Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 2.5" {...field} step="0.01" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="weightUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight Unit</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="kg">Kilograms (kg)</SelectItem>
                              <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <p className="text-sm font-medium mt-2">Dimensions:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <FormField control={form.control} name="length" render={({ field }) => (
                        <FormItem><FormLabel>Length</FormLabel><FormControl><Input type="number" placeholder="e.g., 30" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                     <FormField control={form.control} name="width" render={({ field }) => (
                        <FormItem><FormLabel>Width</FormLabel><FormControl><Input type="number" placeholder="e.g., 20" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                     <FormField control={form.control} name="height" render={({ field }) => (
                        <FormItem><FormLabel>Height</FormLabel><FormControl><Input type="number" placeholder="e.g., 10" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                  </div>
                  <FormField
                    control={form.control}
                    name="dimensionUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dimension Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="cm">Centimeters (cm)</SelectItem>
                            <SelectItem value="in">Inches (in)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                <section className="space-y-4 p-4 border rounded-lg bg-muted/20">
                   <h3 className="text-lg font-semibold text-primary/90 flex items-center gap-2"><MapPin size={20}/>Shipment Route</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="originZip" render={({ field }) => (
                        <FormItem><FormLabel>Origin ZIP/Postal Code</FormLabel><FormControl><Input placeholder="e.g., 90210" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    <FormField control={form.control} name="destinationZip" render={({ field }) => (
                        <FormItem><FormLabel>Destination ZIP/Postal Code</FormLabel><FormControl><Input placeholder="e.g., 10001" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                  </div>
                </section>

                <section className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <h3 className="text-lg font-semibold text-primary/90 flex items-center gap-2"><Shuffle size={20}/>Service Level</h3>
                  <FormField
                    control={form.control}
                    name="serviceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Speed</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select service level" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {serviceLevels.map(level => (
                              <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>
                
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  <Truck size={18} className="mr-2" />
                  {isLoading ? "Estimating..." : "Estimate Shipping Cost (Mock)"}
                </Button>
              </form>
            </Form>

            {isLoading && (
                <div className="flex items-center justify-center text-muted-foreground py-8">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calculating mock estimate...
                </div>
            )}

            {estimateResult && !isLoading && (
              <div className="mt-8 space-y-4 p-6 bg-muted/30 rounded-lg border">
                <h3 className="text-xl font-semibold text-center text-primary font-headline mb-2">Mock Shipping Estimate</h3>
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-500">{formatCurrency(estimateResult.estimatedCost, estimateResult.currency)}</p>
                  <p className="text-sm text-muted-foreground">({estimateResult.currency})</p>
                </div>
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important Disclaimer</AlertTitle>
                  <AlertDescription>
                    {estimateResult.disclaimer}
                  </AlertDescription>
                </Alert>
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

