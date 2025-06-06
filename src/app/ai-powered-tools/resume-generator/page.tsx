
"use client";

import React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, PlusCircle, Trash2, Sparkles, Download, AlertTriangle } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const experienceSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required."),
  company: z.string().min(1, "Company name is required."),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().optional().or(z.literal("Present")),
  responsibilities: z.string().min(10, "Please describe your key responsibilities and achievements (min 10 characters).").max(500, "Keep responsibilities concise (max 500 characters)."),
});

const educationSchema = z.object({
  degree: z.string().min(1, "Degree or certificate name is required."),
  institution: z.string().min(1, "Institution name is required."),
  location: z.string().optional(),
  graduationYear: z.string().min(4, "Graduation year is required (YYYY).").max(4, "Invalid year format."),
  details: z.string().optional().max(200, "Details should be brief (max 200 characters)."),
});

const skillSchema = z.object({
  name: z.string().min(1, "Skill name cannot be empty.").max(50, "Skill name too long (max 50 characters).")
});

const resumeSchema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  linkedin: z.string().url("Invalid LinkedIn URL (e.g., https://linkedin.com/in/yourprofile).").optional().or(z.literal('')),
  github: z.string().url("Invalid GitHub URL (e.g., https://github.com/yourusername).").optional().or(z.literal('')),
  website: z.string().url("Invalid personal website URL.").optional().or(z.literal('')),
  summary: z.string().min(20, "Summary should be at least 20 characters.").max(1000, "Summary is too long (max 1000 characters)."),
  experiences: z.array(experienceSchema).min(1, "At least one work experience is required.").max(5, "Please list a maximum of 5 experiences."),
  educationEntries: z.array(educationSchema).min(1, "At least one education entry is required.").max(3, "Please list a maximum of 3 education entries."),
  skills: z.array(skillSchema).min(3, "Please list at least 3 skills.").max(20, "Please list a maximum of 20 skills."),
});

type ResumeFormData = z.infer<typeof resumeSchema>;

export default function AiResumeGeneratorPage() {
  const { toast } = useToast();
  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      linkedin: "",
      github: "",
      website: "",
      summary: "",
      experiences: [{ jobTitle: "", company: "", location: "", startDate: "", endDate: "Present", responsibilities: "" }],
      educationEntries: [{ degree: "", institution: "", location: "", graduationYear: "", details: "" }],
      skills: [{ name: "" }, { name: "" }, { name: "" }],
    },
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: "educationEntries",
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const onSubmit = (data: ResumeFormData) => {
    // This function is mainly for triggering validation before "Download (Mock)"
    console.log("Resume Data for Mock PDF:", data);
    toast({ title: "Resume Data Validated", description: "Data is ready for mock PDF generation." });
  };

  const handleMockAiSuggestions = () => {
    toast({
      title: "AI Suggestions (Coming Soon!)",
      description: "This feature will provide AI-powered suggestions to improve your resume content. Stay tuned!",
      duration: 5000,
    });
  };

  const handleMockPdfDownload = () => {
    form.handleSubmit(
      (data) => {
        console.log("Resume Data for Mock PDF:", data);
        toast({
          title: "Download PDF (Mock)",
          description: "Resume data logged to console. Actual PDF generation is a feature under development.",
          duration: 5000,
        });
      },
      (errors) => {
        console.error("Validation Errors:", errors);
        toast({ title: "Validation Error", description: "Please fix the errors in the form before downloading.", variant: "destructive" });
      }
    )();
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
                  <FileText size={32} className="text-primary" />
                  AI Powered Resume Generator
                </CardTitle>
                <CardDescription>
                  Fill in your details below. Use the AI suggestions (mock) for help, and then download your resume (mock PDF).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <Alert variant="default">
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>Prototyping Note</AlertTitle>
                  <AlertDescription>
                    The AI-powered content suggestions and direct PDF download functionalities are currently conceptual mock-ups in this prototype.
                  </AlertDescription>
                </Alert>

                {/* Personal Details */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary font-headline">Personal Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="e.g., jane.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Phone Number (Optional)</FormLabel><FormControl><Input type="tel" placeholder="e.g., (555) 123-4567" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="linkedin" render={({ field }) => (
                      <FormItem><FormLabel>LinkedIn Profile URL (Optional)</FormLabel><FormControl><Input placeholder="e.g., https://linkedin.com/in/janedoe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="github" render={({ field }) => (
                      <FormItem><FormLabel>GitHub Profile URL (Optional)</FormLabel><FormControl><Input placeholder="e.g., https://github.com/janedoe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="website" render={({ field }) => (
                      <FormItem><FormLabel>Personal Website/Portfolio (Optional)</FormLabel><FormControl><Input placeholder="e.g., https://janedoe.dev" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </section>

                <Separator />

                {/* Professional Summary */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary font-headline">Professional Summary</h3>
                  <FormField control={form.control} name="summary" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Summary / Objective</FormLabel>
                      <FormControl><Textarea placeholder="A brief overview of your career goals and key qualifications..." {...field} rows={4} /></FormControl>
                      <FormDescription>Highlight your key skills and career ambitions in 2-3 sentences.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </section>

                <Separator />

                {/* Work Experience */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary font-headline">Work Experience</h3>
                  {experienceFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md space-y-3 bg-muted/20 relative">
                      <h4 className="text-md font-medium">Experience #{index + 1}</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name={`experiences.${index}.jobTitle`} render={({ field: itemField }) => (
                          <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input placeholder="e.g., Software Engineer" {...itemField} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`experiences.${index}.company`} render={({ field: itemField }) => (
                          <FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="e.g., Tech Solutions Inc." {...itemField} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name={`experiences.${index}.location`} render={({ field: itemField }) => (
                          <FormItem><FormLabel>Location (Optional)</FormLabel><FormControl><Input placeholder="e.g., San Francisco, CA" {...itemField} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name={`experiences.${index}.startDate`} render={({ field: itemField }) => (
                          <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input placeholder="e.g., Jan 2020 or 01/2020" {...itemField} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`experiences.${index}.endDate`} render={({ field: itemField }) => (
                          <FormItem><FormLabel>End Date (or "Present")</FormLabel><FormControl><Input placeholder="e.g., Dec 2022 or Present" {...itemField} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name={`experiences.${index}.responsibilities`} render={({ field: itemField }) => (
                        <FormItem>
                          <FormLabel>Key Responsibilities & Achievements</FormLabel>
                          <FormControl><Textarea placeholder="Use bullet points for clarity: - Developed feature X... - Led team Y..." {...itemField} rows={5} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      {experienceFields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeExperience(index)} className="absolute top-2 right-2 text-destructive hover:text-destructive/80">
                          <Trash2 size={18} />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendExperience({ jobTitle: "", company: "", location: "", startDate: "", endDate: "Present", responsibilities: "" })} className="mt-2">
                    <PlusCircle size={18} className="mr-2" /> Add Experience
                  </Button>
                </section>

                <Separator />

                {/* Education */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary font-headline">Education</h3>
                  {educationFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-md space-y-3 bg-muted/20 relative">
                       <h4 className="text-md font-medium">Education #{index + 1}</h4>
                      <FormField control={form.control} name={`educationEntries.${index}.degree`} render={({ field: itemField }) => (
                        <FormItem><FormLabel>Degree / Certificate</FormLabel><FormControl><Input placeholder="e.g., B.S. in Computer Science" {...itemField} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`educationEntries.${index}.institution`} render={({ field: itemField }) => (
                        <FormItem><FormLabel>Institution</FormLabel><FormControl><Input placeholder="e.g., University of Example" {...itemField} /></FormControl><FormMessage /></FormItem>
                      )} />
                       <FormField control={form.control} name={`educationEntries.${index}.location`} render={({ field: itemField }) => (
                          <FormItem><FormLabel>Location (Optional)</FormLabel><FormControl><Input placeholder="e.g., Anytown, USA" {...itemField} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`educationEntries.${index}.graduationYear`} render={({ field: itemField }) => (
                        <FormItem><FormLabel>Graduation Year (YYYY)</FormLabel><FormControl><Input placeholder="e.g., 2019" {...itemField} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`educationEntries.${index}.details`} render={({ field: itemField }) => (
                        <FormItem><FormLabel>Additional Details (Optional)</FormLabel><FormControl><Textarea placeholder="e.g., GPA, Honors, Relevant Coursework" {...itemField} rows={2} /></FormControl><FormMessage /></FormItem>
                      )} />
                      {educationFields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeEducation(index)} className="absolute top-2 right-2 text-destructive hover:text-destructive/80">
                          <Trash2 size={18} />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendEducation({ degree: "", institution: "", location: "", graduationYear: "", details: "" })} className="mt-2">
                    <PlusCircle size={18} className="mr-2" /> Add Education
                  </Button>
                </section>

                <Separator />

                {/* Skills */}
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-primary font-headline">Skills</h3>
                   <FormDescription>List your key technical and soft skills.</FormDescription>
                  {skillFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2">
                      <FormField control={form.control} name={`skills.${index}.name`} render={({ field: itemField }) => (
                        <FormItem className="flex-grow">
                          {index === 0 && <FormLabel>Skill</FormLabel>}
                          <FormControl><Input placeholder="e.g., JavaScript, Project Management" {...itemField} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      {skillFields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeSkill(index)} className="text-destructive hover:text-destructive/80 mb-2.5"> {/* Adjust margin to align with input */}
                          <Trash2 size={18} />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendSkill({ name: "" })} className="mt-2">
                    <PlusCircle size={18} className="mr-2" /> Add Skill
                  </Button>
                </section>

              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 pt-8 border-t">
                <Button type="button" variant="outline" onClick={handleMockAiSuggestions} className="w-full sm:w-auto">
                  <Sparkles size={18} className="mr-2" /> Get AI Suggestions (Mock)
                </Button>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button type="submit" variant="secondary" className="w-full sm:w-auto order-2 sm:order-1">Validate Data</Button>
                    <Button type="button" onClick={handleMockPdfDownload} className="w-full sm:w-auto order-1 sm:order-2">
                        <Download size={18} className="mr-2" /> Download PDF (Mock)
                    </Button>
                </div>
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
