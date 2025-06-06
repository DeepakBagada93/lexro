
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Flame, AlertTriangle, User, Droplet, Activity, TrendingUp, TrendingDown, Scale } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)', multiplier: 1.2 },
  { value: 'light', label: 'Lightly active (light exercise/sports 1-3 days/week)', multiplier: 1.375 },
  { value: 'moderate', label: 'Moderately active (moderate exercise/sports 3-5 days/week)', multiplier: 1.55 },
  { value: 'active', label: 'Active (hard exercise/sports 6-7 days a week)', multiplier: 1.725 },
  { value: 'veryActive', label: 'Very active (very hard exercise/sports & physical job)', multiplier: 1.9 },
] as const;

type ActivityLevelValue = typeof activityLevels[number]['value'];

const formSchema = z.object({
  age: z.coerce.number().positive({ message: "Age must be positive." }).int().min(15, "Age must be at least 15.").max(100, "Age must be 100 or less."),
  gender: z.enum(['male', 'female'], { required_error: "Gender is required." }),
  heightUnit: z.enum(['cm', 'ft_in'], { required_error: "Height unit is required." }),
  heightCm: z.coerce.number().positive({ message: "Height must be positive." }).optional(),
  heightFt: z.coerce.number().min(0, { message: "Feet cannot be negative."}).optional(),
  heightIn: z.coerce.number().min(0, { message: "Inches cannot be negative."}).max(11.99, { message: "Inches must be less than 12."}).optional(),
  weightUnit: z.enum(['kg', 'lbs'], { required_error: "Weight unit is required." }),
  weightKg: z.coerce.number().positive({ message: "Weight must be positive." }).optional(),
  weightLbs: z.coerce.number().positive({ message: "Weight must be positive." }).optional(),
  activityLevel: z.enum(activityLevels.map(al => al.value) as [ActivityLevelValue, ...ActivityLevelValue[]], {
    required_error: "Activity level is required.",
  }),
}).superRefine((data, ctx) => {
  if (data.heightUnit === 'cm' && (data.heightCm === undefined || data.heightCm <= 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Height in cm must be a positive number.", path: ['heightCm'] });
  }
  if (data.heightUnit === 'ft_in') {
    if (data.heightFt === undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Feet value is required.", path: ['heightFt'] });
    if (data.heightIn === undefined) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Inches value is required.", path: ['heightIn'] });
    const ft = data.heightFt ?? 0;
    const inches = data.heightIn ?? 0;
    if (ft <= 0 && inches <= 0) {
         ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Total height (ft and in) must be positive.", path: ['heightFt'] });
    }
  }
  if (data.weightUnit === 'kg' && (data.weightKg === undefined || data.weightKg <= 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Weight in kg must be a positive number.", path: ['weightKg'] });
  }
  if (data.weightUnit === 'lbs' && (data.weightLbs === undefined || data.weightLbs <= 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Weight in lbs must be a positive number.", path: ['weightLbs'] });
  }
});

type FormData = z.infer<typeof formSchema>;

interface CalculationResult {
  bmr: number;
  tdee: number;
  caloriesForGoals: {
    maintenance: number;
    mildLoss: number;
    loss: number;
    extremeLoss: number;
    mildGain: number;
    gain: number;
  };
}

export default function BmrCalorieCalculatorPage() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      heightUnit: 'cm',
      weightUnit: 'kg',
      activityLevel: 'sedentary',
    },
  });

  const heightUnit = form.watch('heightUnit');
  const weightUnit = form.watch('weightUnit');

  const onSubmit = (data: FormData) => {
    let heightInCm: number;
    if (data.heightUnit === 'cm') {
      heightInCm = data.heightCm || 0;
    } else {
      const totalInches = ((data.heightFt || 0) * 12) + (data.heightIn || 0);
      heightInCm = totalInches * 2.54;
    }

    let weightInKg: number;
    if (data.weightUnit === 'kg') {
      weightInKg = data.weightKg || 0;
    } else {
      weightInKg = (data.weightLbs || 0) * 0.453592;
    }

    if (heightInCm <= 0 || weightInKg <= 0 || data.age <= 0) {
      form.setError("root", { type: "manual", message: "Age, height, and weight must be positive values."});
      setResult(null);
      return;
    }

    let bmr: number;
    if (data.gender === 'male') {
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * data.age) + 5;
    } else { // female
      bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * data.age) - 161;
    }

    const activityMultiplier = activityLevels.find(al => al.value === data.activityLevel)?.multiplier || 1.2;
    const tdee = bmr * activityMultiplier;

    if (isNaN(bmr) || !isFinite(bmr) || isNaN(tdee) || !isFinite(tdee)) {
        form.setError("root", { type: "manual", message: "Could not calculate. Please check all inputs."});
        setResult(null);
        return;
    }
    
    setResult({
      bmr: parseFloat(bmr.toFixed(0)),
      tdee: parseFloat(tdee.toFixed(0)),
      caloriesForGoals: {
        maintenance: parseFloat(tdee.toFixed(0)),
        mildLoss: parseFloat((tdee - 300).toFixed(0)),
        loss: parseFloat((tdee - 500).toFixed(0)),
        extremeLoss: parseFloat((tdee - 750).toFixed(0)), // Warning needed
        mildGain: parseFloat((tdee + 300).toFixed(0)),
        gain: parseFloat((tdee + 500).toFixed(0)),
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Flame size={28} className="text-primary" />
              BMR & Daily Calorie Calculator
            </CardTitle>
            <CardDescription>Estimate your Basal Metabolic Rate (BMR) and daily calorie needs based on your activity level and goals, using the Mifflin-St Jeor equation.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age (years)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                            setResult(null);
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

                {heightUnit === 'cm' ? (
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
                ) : (
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
                            setResult(null);
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

                {weightUnit === 'kg' ? (
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
                ) : (
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

                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your activity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activityLevels.map(level => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
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
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full sm:w-auto">
                  <Flame size={18} className="mr-2" />
                  Calculate Calories
                </Button>
              </form>
            </Form>

            {result && (
              <div className="mt-8 space-y-6 p-6 bg-muted/30 rounded-lg border">
                <h3 className="text-2xl font-semibold text-center text-primary font-headline">Your Estimated Calorie Needs</h3>
                
                <div className="text-center p-4 bg-card rounded-md shadow-sm">
                  <p className="text-sm text-muted-foreground">Your Basal Metabolic Rate (BMR)</p>
                  <p className="text-3xl font-bold">{result.bmr.toLocaleString()} Calories/day</p>
                  <p className="text-xs text-muted-foreground mt-1">Calories your body burns at rest to maintain vital functions.</p>
                </div>

                <div className="text-center p-4 bg-card rounded-md shadow-sm">
                  <p className="text-sm text-muted-foreground">To Maintain Your Current Weight</p>
                  <p className="text-3xl font-bold text-primary">{result.caloriesForGoals.maintenance.toLocaleString()} Calories/day</p>
                  <p className="text-xs text-muted-foreground mt-1">(This is your TDEE - Total Daily Energy Expenditure)</p>
                </div>
                
                <h4 className="text-xl font-semibold text-center text-primary/90 font-headline pt-2">Calories for Weight Goals:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-card rounded-md shadow-sm">
                        <p className="text-sm text-muted-foreground flex items-center gap-1"><TrendingDown size={16} /> Mild Weight Loss (~0.25-0.3kg/week)</p>
                        <p className="text-lg font-semibold">{result.caloriesForGoals.mildLoss.toLocaleString()} Calories/day</p>
                    </div>
                    <div className="p-3 bg-card rounded-md shadow-sm">
                        <p className="text-sm text-muted-foreground flex items-center gap-1"><TrendingDown size={16} /> Weight Loss (~0.5kg/week)</p>
                        <p className="text-lg font-semibold">{result.caloriesForGoals.loss.toLocaleString()} Calories/day</p>
                    </div>
                    <div className="p-3 bg-card rounded-md shadow-sm">
                        <p className="text-sm text-muted-foreground flex items-center gap-1"><TrendingUp size={16} /> Mild Weight Gain</p>
                        <p className="text-lg font-semibold">{result.caloriesForGoals.mildGain.toLocaleString()} Calories/day</p>
                    </div>
                    <div className="p-3 bg-card rounded-md shadow-sm">
                        <p className="text-sm text-muted-foreground flex items-center gap-1"><TrendingUp size={16} /> Weight Gain</p>
                        <p className="text-lg font-semibold">{result.caloriesForGoals.gain.toLocaleString()} Calories/day</p>
                    </div>
                </div>
                {result.caloriesForGoals.extremeLoss < 1200 && (
                     <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Caution: Extreme Calorie Deficit</AlertTitle>
                        <AlertDescription>
                            Calculated calories for "Extreme Weight Loss" ({result.caloriesForGoals.extremeLoss.toLocaleString()} Cal/day) are very low. Consuming fewer than 1200-1500 calories per day is generally not recommended without medical supervision.
                        </AlertDescription>
                    </Alert>
                )}
              </div>
            )}
            <Alert variant="default" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Disclaimer</AlertTitle>
              <AlertDescription>
                These calculations are estimates based on the Mifflin-St Jeor equation and average activity multipliers. Individual needs can vary. Consult a healthcare provider or registered dietitian for personalized nutrition and health advice.
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
