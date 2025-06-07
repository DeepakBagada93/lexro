
"use client";

import React, { useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, PlusCircle, Trash2, Users, CalendarDays, Utensils, Ticket, BedDouble, Package, AlertCircle, Percent } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const expenseItemSchema = z.object({
  description: z.string().min(1, "Description is required."),
  amount: z.coerce.number().min(0, "Amount must be non-negative.").default(0),
});

const accommodationItemSchema = z.object({
  description: z.string().min(1, "Description is required."),
  nights: z.coerce.number().min(1, "Number of nights must be at least 1.").default(1),
  costPerNight: z.coerce.number().min(0, "Cost per night must be non-negative.").default(0),
});

const tripBudgetSchema = z.object({
  tripName: z.string().optional(),
  numberOfTravelers: z.coerce.number().min(1, "At least one traveler.").default(1),
  numberOfDays: z.coerce.number().min(1, "Trip must be at least one day.").default(1),
  transportations: z.array(expenseItemSchema).optional(),
  accommodations: z.array(accommodationItemSchema).optional(),
  foodDailyEstimate: z.coerce.number().min(0, "Daily food estimate must be non-negative.").default(0),
  activities: z.array(expenseItemSchema).optional(),
  miscellaneous: z.array(expenseItemSchema).optional(),
  contingencyPercentage: z.coerce.number().min(0).max(100, "Contingency must be between 0 and 100.").default(10),
});

type TripBudgetFormData = z.infer<typeof tripBudgetSchema>;

interface CalculatedTotals {
  totalTransportation: number;
  totalAccommodation: number;
  totalFood: number;
  totalActivities: number;
  totalMiscellaneous: number;
  subtotal: number;
  contingencyAmount: number;
  grandTotal: number;
  perPersonCost: number;
}

export default function TripBudgetCalculatorPage() {
  const { toast } = useToast();
  const form = useForm<TripBudgetFormData>({
    resolver: zodResolver(tripBudgetSchema),
    defaultValues: {
      tripName: "",
      numberOfTravelers: 1,
      numberOfDays: 1,
      transportations: [{ description: "", amount: 0 }],
      accommodations: [{ description: "", nights: 1, costPerNight: 0 }],
      foodDailyEstimate: 0,
      activities: [{ description: "", amount: 0 }],
      miscellaneous: [{ description: "", amount: 0 }],
      contingencyPercentage: 10,
    },
  });

  const { fields: transportFields, append: appendTransport, remove: removeTransport } = useFieldArray({ control: form.control, name: "transportations" });
  const { fields: accommodationFields, append: appendAccommodation, remove: removeAccommodation } = useFieldArray({ control: form.control, name: "accommodations" });
  const { fields: activityFields, append: appendActivity, remove: removeActivity } = useFieldArray({ control: form.control, name: "activities" });
  const { fields: miscFields, append: appendMisc, remove: removeMisc } = useFieldArray({ control: form.control, name: "miscellaneous" });

  const watchedValues = form.watch();

  const calculatedTotals = useMemo((): CalculatedTotals => {
    const totalTransportation = watchedValues.transportations?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const totalAccommodation = watchedValues.accommodations?.reduce((sum, item) => sum + ((item.nights || 0) * (item.costPerNight || 0)), 0) || 0;
    const totalFood = (watchedValues.foodDailyEstimate || 0) * (watchedValues.numberOfDays || 0);
    const totalActivities = watchedValues.activities?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const totalMiscellaneous = watchedValues.miscellaneous?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

    const subtotal = totalTransportation + totalAccommodation + totalFood + totalActivities + totalMiscellaneous;
    const contingencyAmount = subtotal * ((watchedValues.contingencyPercentage || 0) / 100);
    const grandTotal = subtotal + contingencyAmount;
    const perPersonCost = (watchedValues.numberOfTravelers || 1) > 0 ? grandTotal / (watchedValues.numberOfTravelers || 1) : 0;

    return {
      totalTransportation,
      totalAccommodation,
      totalFood,
      totalActivities,
      totalMiscellaneous,
      subtotal,
      contingencyAmount,
      grandTotal,
      perPersonCost,
    };
  }, [watchedValues]);

  const onSubmit = (data: TripBudgetFormData) => {
    console.log("Trip Budget Data:", data, "Calculated Totals:", calculatedTotals);
    toast({ title: "Budget Calculated", description: "Your trip budget has been estimated." });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const renderExpenseArraySection = (
    title: string,
    icon: React.ElementType,
    fields: any[], // Should be specific type from useFieldArray
    removeFn: (index: number) => void,
    appendFn: () => void,
    namePrefix: "transportations" | "activities" | "miscellaneous"
  ) => {
    const IconComponent = icon;
    return (
      <section className="space-y-4 p-4 border rounded-lg bg-muted/20">
        <h3 className="text-xl font-semibold text-primary font-headline flex items-center gap-2"><IconComponent size={22} />{title}</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="p-3 border rounded-md space-y-2 bg-card/50 relative">
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
              <FormField control={form.control} name={`${namePrefix}.${index}.description`} render={({ field: itemField }) => (
                <FormItem className="sm:col-span-4"><FormLabel className="text-xs">Description</FormLabel><FormControl><Input placeholder="e.g., Flight tickets" {...itemField} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name={`${namePrefix}.${index}.amount`} render={({ field: itemField }) => (
                <FormItem className="sm:col-span-2"><FormLabel className="text-xs">Amount ($)</FormLabel><FormControl><Input type="number" placeholder="100.00" {...itemField} step="0.01"/></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            {fields.length > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removeFn(index)} className="absolute top-1 right-1 text-destructive hover:text-destructive/80 h-7 w-7">
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={appendFn} className="mt-2">
          <PlusCircle size={16} className="mr-2" /> Add {title.slice(0, -1)}
        </Button>
      </section>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="max-w-3xl mx-auto shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-3xl">
                  <Briefcase size={32} className="text-primary" />
                  Trip Budget Calculator
                </CardTitle>
                <CardDescription>Plan your travel expenses meticulously. All amounts are assumed in USD.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Trip Details */}
                <section className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <h3 className="text-xl font-semibold text-primary font-headline">Trip Details</h3>
                    <FormField control={form.control} name="tripName" render={({ field }) => (
                      <FormItem><FormLabel>Trip Name (Optional)</FormLabel><FormControl><Input placeholder="e.g., Summer Vacation to Paris" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="numberOfTravelers" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center gap-1"><Users size={16}/>Number of Travelers</FormLabel><FormControl><Input type="number" placeholder="1" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="numberOfDays" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center gap-1"><CalendarDays size={16}/>Number of Days</FormLabel><FormControl><Input type="number" placeholder="7" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    </div>
                </section>

                {renderExpenseArraySection("Transportations", Plane, transportFields, removeTransport, () => appendTransport({ description: "", amount: 0 }), "transportations")}
                
                {/* Accommodations */}
                <section className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <h3 className="text-xl font-semibold text-primary font-headline flex items-center gap-2"><BedDouble size={22}/>Accommodations</h3>
                  {accommodationFields.map((field, index) => (
                    <div key={field.id} className="p-3 border rounded-md space-y-2 bg-card/50 relative">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                        <FormField control={form.control} name={`accommodations.${index}.description`} render={({ field: itemField }) => (
                          <FormItem className="sm:col-span-3"><FormLabel className="text-xs">Description</FormLabel><FormControl><Input placeholder="e.g., Hotel Downtown" {...itemField} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`accommodations.${index}.nights`} render={({ field: itemField }) => (
                          <FormItem><FormLabel className="text-xs">Nights</FormLabel><FormControl><Input type="number" placeholder="3" {...itemField} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`accommodations.${index}.costPerNight`} render={({ field: itemField }) => (
                          <FormItem><FormLabel className="text-xs">Cost/Night ($)</FormLabel><FormControl><Input type="number" placeholder="150.00" {...itemField} step="0.01"/></FormControl><FormMessage /></FormItem>
                        )} />
                         <div className="flex items-center h-10">
                            <p className="text-sm font-medium">Total: {formatCurrency((form.watch(`accommodations.${index}.nights`) || 0) * (form.watch(`accommodations.${index}.costPerNight`) || 0))}</p>
                        </div>
                      </div>
                      {accommodationFields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeAccommodation(index)} className="absolute top-1 right-1 text-destructive hover:text-destructive/80 h-7 w-7">
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendAccommodation({ description: "", nights: 1, costPerNight: 0 })} className="mt-2">
                    <PlusCircle size={16} className="mr-2" /> Add Accommodation
                  </Button>
                </section>

                {/* Food & Drinks */}
                <section className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <h3 className="text-xl font-semibold text-primary font-headline flex items-center gap-2"><Utensils size={22}/>Food & Drinks</h3>
                    <FormField control={form.control} name="foodDailyEstimate" render={({ field }) => (
                        <FormItem><FormLabel>Estimated Daily Cost per Person ($)</FormLabel><FormControl><Input type="number" placeholder="50.00" {...field} step="0.01" /></FormControl>
                        <FormDescription>This will be multiplied by number of days and travelers.</FormDescription><FormMessage /></FormItem>
                    )} />
                </section>

                {renderExpenseArraySection("Activities & Entertainment", Ticket, activityFields, removeActivity, () => appendActivity({ description: "", amount: 0 }), "activities")}
                {renderExpenseArraySection("Miscellaneous Expenses", Package, miscFields, removeMisc, () => appendMisc({ description: "", amount: 0 }), "miscellaneous")}

                {/* Contingency */}
                <section className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <h3 className="text-xl font-semibold text-primary font-headline flex items-center gap-2"><Percent size={22}/>Contingency Fund</h3>
                    <FormField control={form.control} name="contingencyPercentage" render={({ field }) => (
                        <FormItem><FormLabel>Percentage of Subtotal (%)</FormLabel><FormControl><Input type="number" placeholder="10" {...field} min="0" max="100" /></FormControl>
                        <FormDescription>A buffer for unexpected expenses.</FormDescription><FormMessage /></FormItem>
                    )} />
                </section>

                {/* Summary */}
                {form.formState.isSubmitted && (
                  <section className="space-y-3 p-6 border rounded-lg bg-primary/5 text-primary-foreground shadow-lg">
                    <h3 className="text-2xl font-bold text-primary font-headline text-center mb-4">Trip Budget Summary</h3>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between py-1 border-b border-primary/20"><span className="text-muted-foreground">Total Transportation:</span><span>{formatCurrency(calculatedTotals.totalTransportation)}</span></div>
                        <div className="flex justify-between py-1 border-b border-primary/20"><span className="text-muted-foreground">Total Accommodation:</span><span>{formatCurrency(calculatedTotals.totalAccommodation)}</span></div>
                        <div className="flex justify-between py-1 border-b border-primary/20"><span className="text-muted-foreground">Total Food & Drinks:</span><span>{formatCurrency(calculatedTotals.totalFood * (watchedValues.numberOfTravelers || 1) )}</span></div>
                        <div className="flex justify-between py-1 border-b border-primary/20"><span className="text-muted-foreground">Total Activities:</span><span>{formatCurrency(calculatedTotals.totalActivities)}</span></div>
                        <div className="flex justify-between py-1 border-b border-primary/20"><span className="text-muted-foreground">Total Miscellaneous:</span><span>{formatCurrency(calculatedTotals.totalMiscellaneous)}</span></div>
                        <Separator className="my-2 bg-primary/30" />
                        <div className="flex justify-between font-semibold py-1"><span className="text-muted-foreground">Subtotal:</span><span>{formatCurrency(calculatedTotals.subtotal)}</span></div>
                        <div className="flex justify-between py-1"><span className="text-muted-foreground">Contingency ({watchedValues.contingencyPercentage}%):</span><span>{formatCurrency(calculatedTotals.contingencyAmount)}</span></div>
                        <Separator className="my-2 bg-primary/30" />
                        <div className="flex justify-between text-xl font-bold py-2 text-primary"><span >Grand Total:</span><span>{formatCurrency(calculatedTotals.grandTotal)}</span></div>
                        <div className="flex justify-between text-md font-semibold py-1"><span className="text-muted-foreground">Cost Per Person:</span><span>{formatCurrency(calculatedTotals.perPersonCost)}</span></div>
                    </div>
                  </section>
                )}


              </CardContent>
              <CardFooter className="flex justify-end pt-8">
                <Button type="submit" size="lg">Calculate Budget</Button>
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
