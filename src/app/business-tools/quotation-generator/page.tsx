
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FilePlus, PlusCircle, Trash2, Printer, Image as ImageIcon } from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import ImageUpload from '@/components/shared/ImageUpload';
import { fileToDataUri } from '@/lib/imageUtils';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required."),
  quantity: z.coerce.number().min(0, "Quantity must be non-negative.").default(1),
  unitPrice: z.coerce.number().min(0, "Unit price must be non-negative.").default(0),
});

const quotationSchema = z.object({
  yourName: z.string().min(1, "Your name is required."),
  yourAddress: z.string().min(1, "Your address is required."),
  yourEmail: z.string().email().optional().or(z.literal('')),
  yourPhone: z.string().optional(),
  yourLogo: z.string().optional(), 

  clientName: z.string().min(1, "Client name is required."),
  clientAddress: z.string().min(1, "Client address is required."),
  clientEmail: z.string().email().optional().or(z.literal('')),

  quotationNumber: z.string().min(1, "Quotation number is required."),
  quotationDate: z.string().min(1, "Quotation date is required."),
  validUntilDate: z.string().min(1, "Valid until date is required."),

  items: z.array(lineItemSchema).min(1, "At least one item is required."),
  
  taxRate: z.coerce.number().min(0).max(100).default(0).optional(),
  notes: z.string().optional(),
});

type QuotationFormData = z.infer<typeof quotationSchema>;

export default function QuotationGeneratorPage() {
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      yourName: "",
      yourAddress: "",
      yourEmail: "",
      yourPhone: "",
      yourLogo: "",
      clientName: "",
      clientAddress: "",
      clientEmail: "",
      quotationNumber: `QUOTE-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-`,
      quotationDate: new Date().toISOString().split('T')[0],
      validUntilDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      taxRate: 0,
      notes: "Thank you for your inquiry. This quotation is valid for 30 days from the date of issue.",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const watchedTaxRate = form.watch("taxRate");

  const subtotal = useMemo(() => {
    return watchedItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  }, [watchedItems]);

  const taxAmount = useMemo(() => {
    return subtotal * ((watchedTaxRate || 0) / 100);
  }, [subtotal, watchedTaxRate]);

  const grandTotal = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  const handleLogoUpload = async (file: File) => {
    try {
      const dataUrl = await fileToDataUri(file);
      setLogoDataUrl(dataUrl);
      form.setValue("yourLogo", dataUrl);
      toast({ title: "Logo Uploaded", description: "Your logo has been added to the quotation." });
    } catch (error) {
      toast({ title: "Logo Upload Failed", description: "Could not process the logo image.", variant: "destructive" });
    }
  };
  
  const onSubmit = (data: QuotationFormData) => {
    console.log("Quotation Data:", data);
    toast({ title: "Quotation Ready", description: "Quotation data is valid and ready for printing." });
  };

  const handlePrint = () => {
    form.handleSubmit(
      (data) => { 
        console.log("Quotation Data for Print:", data);
        toast({ title: "Printing Quotation..." });
        setTimeout(() => window.print(), 100);
      },
      (errors) => { 
        console.error("Validation Errors:", errors);
        toast({ title: "Validation Error", description: "Please fix the errors before printing.", variant: "destructive" });
      }
    )();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background text-foreground print:bg-white print:text-black">
        <Header className="print:hidden" />
        <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card className="max-w-4xl mx-auto shadow-xl print:shadow-none print:border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-3xl">
                    <FilePlus size={32} className="text-primary" />
                    Quotation Generator
                  </CardTitle>
                  <CardDescription>Create and print a professional quotation for your clients.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <section className="space-y-4">
                      <h3 className="text-xl font-semibold text-primary font-headline">Your Details</h3>
                       <FormField
                        control={form.control}
                        name="yourLogo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 cursor-pointer">
                                <ImageIcon size={18} /> {logoDataUrl ? "Change Logo" : "Upload Logo (Optional)"}
                            </FormLabel>
                            <ImageUpload 
                                onFileSelect={handleLogoUpload} 
                                acceptedFileTypes={["image/png", "image/jpeg", "image/gif"]}
                            />
                            {logoDataUrl && (
                                <div className="mt-2 border rounded-md p-2 inline-block bg-muted/30">
                                    <Image src={logoDataUrl} alt="Your Logo" width={100} height={100} className="max-h-20 object-contain" />
                                </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField control={form.control} name="yourName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name/Company</FormLabel>
                          <FormControl><Input placeholder="Your Company LLC" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="yourAddress" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Address</FormLabel>
                          <FormControl><Textarea placeholder="123 Main St, Anytown, USA" {...field} rows={3} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="yourEmail" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Email</FormLabel>
                          <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="yourPhone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Phone (Optional)</FormLabel>
                          <FormControl><Input type="tel" placeholder="(555) 123-4567" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-xl font-semibold text-primary font-headline">Client Details</h3>
                      <FormField control={form.control} name="clientName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Name/Company</FormLabel>
                          <FormControl><Input placeholder="Client Corp." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="clientAddress" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Address</FormLabel>
                          <FormControl><Textarea placeholder="456 Client Ave, Otherville, USA" {...field} rows={3} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="clientEmail" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Email (Optional)</FormLabel>
                          <FormControl><Input type="email" placeholder="client@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </section>
                  </div>

                  <Separator />

                  <section className="space-y-4">
                     <h3 className="text-xl font-semibold text-primary font-headline">Quotation Details</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField control={form.control} name="quotationNumber" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quotation Number</FormLabel>
                          <FormControl><Input placeholder="QUOTE-2024-001" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="quotationDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quotation Date</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="validUntilDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valid Until</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </section>

                  <Separator />

                  <section className="space-y-4">
                    <h3 className="text-xl font-semibold text-primary font-headline">Items / Services</h3>
                    <div className="space-y-4" id="quotation-items-section">
                      {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-12 gap-x-2 gap-y-3 items-start p-3 border rounded-md bg-muted/20">
                          <FormField control={form.control} name={`items.${index}.description`} render={({ field: itemField }) => (
                            <FormItem className="col-span-12 md:col-span-5">
                              {index === 0 && <FormLabel>Description</FormLabel>}
                              <FormControl><Input placeholder="Service or Product" {...itemField} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`items.${index}.quantity`} render={({ field: itemField }) => (
                            <FormItem className="col-span-6 md:col-span-2">
                              {index === 0 && <FormLabel>Quantity</FormLabel>}
                              <FormControl><Input type="number" placeholder="1" {...itemField} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field: itemField }) => (
                            <FormItem className="col-span-6 md:col-span-2">
                              {index === 0 && <FormLabel>Unit Price</FormLabel>}
                              <FormControl><Input type="number" placeholder="100.00" step="0.01" {...itemField} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <div className="col-span-12 md:col-span-2">
                             {index === 0 && <FormLabel>Total</FormLabel>}
                            <p className="h-10 flex items-center font-medium print:h-auto">
                               {formatCurrency(watchedItems[index]?.quantity * watchedItems[index]?.unitPrice || 0)}
                            </p>
                          </div>
                          <div className="col-span-12 md:col-span-1 flex items-end md:pt-5">
                            {fields.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive/80 print:hidden">
                                <Trash2 size={18} />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
                      className="print:hidden"
                    >
                      <PlusCircle size={18} className="mr-2" /> Add Item
                    </Button>
                  </section>

                  <Separator />

                  <div className="grid md:grid-cols-3 gap-8">
                    <section className="md:col-span-2 space-y-4">
                      <h3 className="text-xl font-semibold text-primary font-headline">Notes / Terms</h3>
                       <FormField control={form.control} name="notes" render={({ field }) => (
                        <FormItem>
                          <FormControl><Textarea placeholder="Payment terms, scope of work, etc." {...field} rows={4} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </section>

                    <section className="space-y-3" id="quotation-summary-section">
                      <h3 className="text-xl font-semibold text-primary font-headline md:text-right">Summary</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                         <FormField control={form.control} name="taxRate" render={({ field }) => (
                            <FormItem className="flex-grow">
                              <FormLabel className="text-muted-foreground text-sm">Tax Rate (%):</FormLabel>
                              <FormControl><Input type="number" placeholder="0" {...field} className="h-8 text-right" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Tax Amount:</span>
                        <span className="font-medium">{formatCurrency(taxAmount)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center text-xl font-bold text-primary">
                        <span>Grand Total:</span>
                        <span>{formatCurrency(grandTotal)}</span>
                      </div>
                    </section>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 pt-8 print:hidden">
                   <Button type="submit" variant="outline" className="print:hidden">Validate Data</Button>
                  <Button type="button" onClick={handlePrint} className="print:hidden">
                    <Printer size={18} className="mr-2" /> Print / Save as PDF
                  </Button>
                </CardFooter>
              </Card>

              {/* Hidden section for print view */}
              <div id="print-quotation-content" className="hidden print:block p-8">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        {logoDataUrl && <Image src={logoDataUrl} alt="Company Logo" width={150} height={75} className="max-h-[75px] object-contain mb-4" />}
                        <h1 className="text-3xl font-bold text-primary">{form.getValues("yourName")}</h1>
                        <p className="whitespace-pre-line">{form.getValues("yourAddress")}</p>
                        {form.getValues("yourEmail") && <p>{form.getValues("yourEmail")}</p>}
                        {form.getValues("yourPhone") && <p>{form.getValues("yourPhone")}</p>}
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-bold uppercase text-gray-700">QUOTATION</h2>
                        <p><span className="font-semibold">Quotation #:</span> {form.getValues("quotationNumber")}</p>
                        <p><span className="font-semibold">Date:</span> {form.getValues("quotationDate")}</p>
                        <p><span className="font-semibold">Valid Until:</span> {form.getValues("validUntilDate")}</p>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">Quote To:</h3>
                    <p className="font-bold">{form.getValues("clientName")}</p>
                    <p className="whitespace-pre-line">{form.getValues("clientAddress")}</p>
                    {form.getValues("clientEmail") && <p>{form.getValues("clientEmail")}</p>}
                </div>

                <table className="w-full mb-8 text-sm">
                    <thead>
                        <tr className="bg-muted/30">
                            <th className="p-2 text-left font-semibold">Description</th>
                            <th className="p-2 text-right font-semibold">Quantity</th>
                            <th className="p-2 text-right font-semibold">Unit Price</th>
                            <th className="p-2 text-right font-semibold">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {watchedItems.map((item, index) => (
                            <tr key={index} className="border-b">
                                <td className="p-2">{item.description}</td>
                                <td className="p-2 text-right">{item.quantity}</td>
                                <td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                                <td className="p-2 text-right">{formatCurrency(item.quantity * item.unitPrice)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end mb-8">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
                        <div className="flex justify-between"><span>Tax ({watchedTaxRate || 0}%):</span><span>{formatCurrency(taxAmount)}</span></div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Grand Total:</span><span>{formatCurrency(grandTotal)}</span></div>
                    </div>
                </div>

                {form.getValues("notes") && (
                    <div className="mb-8">
                        <h4 className="font-semibold mb-1 text-gray-600">Notes/Terms:</h4>
                        <p className="text-xs whitespace-pre-line">{form.getValues("notes")}</p>
                    </div>
                )}
                 <footer className="text-center text-xs text-gray-500 border-t pt-4">
                    <p>Thank you for your consideration!</p>
                 </footer>
              </div>
            </form>
          </Form>
        </main>
        <footer className="text-center py-8 border-t border-border print:hidden">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Lexro AI. All rights reserved.
          </p>
        </footer>
      </div>
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0;
            padding: 0;
            font-size: 10pt;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:bg-white {
             background-color: white !important;
          }
          .print\\:text-black {
             color: black !important;
          }
           .print\\:shadow-none {
             box-shadow: none !important;
           }
           .print\\:border-none {
            border: none !important;
           }
           .print\\:p-0 {
            padding: 0 !important;
           }
           .print\\:text-sm {
            font-size: 0.875rem; /* 14px */
           }
           .print\\:text-xs {
            font-size: 0.75rem; /* 12px */
           }
           .print\\:h-auto {
             height: auto !important;
           }
           #print-quotation-content {
             max-width: 100%;
             margin: 0 auto; 
           }
           #print-quotation-content h1, #print-quotation-content h2, #print-quotation-content h3, #print-quotation-content h4 {
             color: #333 !important; 
           }
           #print-quotation-content .text-primary {
             color: #4f46e5 !important; 
           }
           #print-quotation-content table th, #print-quotation-content table td {
             border-color: #e5e7eb !important; 
           }
           #print-quotation-content .bg-muted\\/30 {
             background-color: #f3f4f6 !important; 
           }
        }
      `}</style>
    </>
  );
}

