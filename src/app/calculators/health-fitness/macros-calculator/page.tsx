
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Flame, PieChart as PieChartIcon, AlertTriangle, Apple, Drumstick, Fish } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend } from "recharts";


const activityLevels = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)', multiplier: 1.2 },
  { value: 'light', label: 'Lightly active (light exercise/sports 1-3 days/week)', multiplier: 1.375 },
  { value: 'moderate', label: 'Moderately active (moderate exercise/sports 3-5 days/week)', multiplier: 1.55 },
  { value: 'active', label: 'Active (hard exercise/sports 6-7 days a week)', multiplier: 1.725 },
  { value: 'veryActive', label: 'Very active (very hard exercise/sports & physical job)', multiplier: 1.9 },
] as const;

type ActivityLevelValue = typeof activityLevels[number]['value'];

const fitnessGoals = [
  { value: 'lose', label: 'Lose Weight (~0.5kg/week)', calorieAdjustment: -500, ratios: { protein: 0.40, carbs: 0.30, fat: 0.30 } },
  { value: 'maintain', label: 'Maintain Weight', calorieAdjustment: 0, ratios: { protein: 0.30, carbs: 0.40, fat: 0.30 } },
  { value: 'gain', label: 'Gain Muscle (~0.25kg/week)', calorieAdjustment: +300, ratios: { protein: 0.35, carbs: 0.45, fat: 0.20 } },
] as const;

type FitnessGoalValue = typeof fitnessGoals[number]['value'];

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
  fitnessGoal: z.enum(fitnessGoals.map(fg => fg.value) as [FitnessGoalValue, ...FitnessGoalValue[]], {
    required_error: "Fitness goal is required.",
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

interface MacrosResult {
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  ratios: { protein: number; carbs: number; fat: number };
}

const chartConfig = {
  protein: { label: "Protein", color: "hsl(var(--chart-1))", icon: Drumstick },
  carbs: { label: "Carbs", color: "hsl(var(--chart-2))", icon: Apple },
  fat: { label: "Fat", color: "hsl(var(--chart-3))", icon: Fish },
} satisfies ChartConfig;


export default function MacrosCalculatorPage() {
  const [result, setResult] = useState<MacrosResult | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      heightUnit: 'cm',
      weightUnit: 'kg',
      activityLevel: 'sedentary',
      fitnessGoal: 'maintain',
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

    const selectedGoal = fitnessGoals.find(fg => fg.value === data.fitnessGoal);
    if (!selectedGoal) {
      form.setError("fitnessGoal", { type: "manual", message: "Invalid fitness goal selected."});
      setResult(null);
      return;
    }

    const targetCalories = tdee + selectedGoal.calorieAdjustment;
    
    if (targetCalories < 1200) {
        form.setError("root", {type: "manual", message: `Target calories (${targetCalories.toFixed(0)}) are very low. Re-evaluate your goals or consult a professional.`})
        setResult(null);
        return;
    }


    const proteinGrams = (targetCalories * selectedGoal.ratios.protein) / 4;
    const carbsGrams = (targetCalories * selectedGoal.ratios.carbs) / 4;
    const fatGrams = (targetCalories * selectedGoal.ratios.fat) / 9;

    if (isNaN(bmr) || !isFinite(bmr) || isNaN(tdee) || !isFinite(tdee)) {
        form.setError("root", { type: "manual", message: "Could not calculate. Please check all inputs."});
        setResult(null);
        return;
    }
    
    setResult({
      targetCalories: parseFloat(targetCalories.toFixed(0)),
      proteinGrams: parseFloat(proteinGrams.toFixed(0)),
      carbsGrams: parseFloat(carbsGrams.toFixed(0)),
      fatGrams: parseFloat(fatGrams.toFixed(0)),
      ratios: selectedGoal.ratios,
    });
  };

  const chartData = result ? [
    { name: 'protein', value: result.proteinGrams, fill: chartConfig.protein.color, label: chartConfig.protein.label },
    { name: 'carbs', value: result.carbsGrams, fill: chartConfig.carbs.color, label: chartConfig.carbs.label },
    { name: 'fat', value: result.fatGrams, fill: chartConfig.fat.color, label: chartConfig.fat.label },
  ] : [];


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <PieChartIcon size={28} className="text-primary" />
              Macronutrient Calculator
            </CardTitle>
            <CardDescription>Estimate your daily macronutrient needs (protein, carbs, fats) based on your details, activity, and fitness goals.</CardDescription>
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

                <FormField
                  control={form.control}
                  name="fitnessGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Fitness Goal</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your fitness goal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fitnessGoals.map(goal => (
                            <SelectItem key={goal.value} value={goal.value}>
                              {goal.label}
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
                  <PieChartIcon size={18} className="mr-2" />
                  Calculate Macros
                </Button>
              </form>
            </Form>

            {result && (
              <div className="mt-8 space-y-6 p-6 bg-muted/30 rounded-lg border">
                <h3 className="text-2xl font-semibold text-center text-primary font-headline">Your Estimated Macronutrient Needs</h3>
                
                <div className="text-center p-4 bg-card rounded-md shadow-sm">
                  <p className="text-sm text-muted-foreground">Target Daily Calories</p>
                  <p className="text-3xl font-bold text-primary">{result.targetCalories.toLocaleString()} Calories/day</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-card rounded-md shadow-sm text-center">
                         <Drumstick size={24} className="mx-auto mb-2 text-primary/80" />
                        <p className="text-sm text-muted-foreground">Protein ({ (result.ratios.protein * 100).toFixed(0) }%)</p>
                        <p className="text-2xl font-semibold">{result.proteinGrams.toLocaleString()}g</p>
                    </div>
                    <div className="p-4 bg-card rounded-md shadow-sm text-center">
                        <Apple size={24} className="mx-auto mb-2 text-primary/80" />
                        <p className="text-sm text-muted-foreground">Carbohydrates ({ (result.ratios.carbs * 100).toFixed(0) }%)</p>
                        <p className="text-2xl font-semibold">{result.carbsGrams.toLocaleString()}g</p>
                    </div>
                    <div className="p-4 bg-card rounded-md shadow-sm text-center">
                        <Fish size={24} className="mx-auto mb-2 text-primary/80" />
                        <p className="text-sm text-muted-foreground">Fat ({ (result.ratios.fat * 100).toFixed(0) }%)</p>
                        <p className="text-2xl font-semibold">{result.fatGrams.toLocaleString()}g</p>
                    </div>
                </div>

                {chartData.length > 0 && (result.proteinGrams > 0 || result.carbsGrams > 0 || result.fatGrams > 0) && (
                    <div className="h-[300px] w-full mt-6">
                        <ChartContainer config={chartConfig} className="w-full h-full">
                        <PieChart accessibilityLayer>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent 
                                    hideLabel 
                                    formatter={(value, name, props) => [`${(value as number).toLocaleString()}g`, chartConfig[name as keyof typeof chartConfig]?.label || name]}
                                />}
                            />
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                innerRadius={60}
                                strokeWidth={2}
                            >
                            {chartData.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={entry.fill} stroke={entry.fill} />
                            ))}
                            </Pie>
                            <Legend
                                content={({ payload }) => {
                                return (
                                    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4">
                                    {payload?.map((entry, index) => (
                                        <li key={`item-${index}`} className="flex items-center gap-1.5 text-sm">
                                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                        {chartConfig[entry.dataKey as keyof typeof chartConfig]?.label} ({(entry.payload?.value as number).toLocaleString()}g)
                                        </li>
                                    ))}
                                    </ul>
                                )
                                }}
                            />
                        </PieChart>
                        </ChartContainer>
                    </div>
                )}
              </div>
            )}
            <Alert variant="default" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Disclaimer</AlertTitle>
              <AlertDescription>
                These calculations are estimates. Individual macronutrient needs can vary significantly based on specific health conditions, body composition, and precise activity levels. Consult a healthcare provider or registered dietitian for personalized nutrition advice.
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

