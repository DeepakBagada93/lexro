import { Combine, Eraser, Crop, Replace, Palette, Layers, ChevronDown, Calculator as CalculatorIcon, Landmark, Brain, FileJson, TextCursorInput, BookOpenCheck, Tags, Timer, Scale, Flame, PieChart, Target, Gauge, Droplet, HeartPulse, Briefcase, Globe, Leaf, Backpack, CalendarDays, Plane, ShoppingCart, Tag, BadgePercent, Truck, Boxes, BadgeDollarSign, FileText, FilePlus, FileSpreadsheet, FileLock2, FileLock, FileSignature, Building } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const imageTools = [
  { name: "Background Remover", href: "/tools/background-remover", icon: Eraser, description: "Remove backgrounds from images quickly." },
  { name: "Image Cropper", href: "/tools/image-cropper", icon: Crop, description: "Crop images to desired dimensions." },
  { name: "JPG to PNG Converter", href: "/tools/jpg-to-png", icon: Replace, description: "Convert JPG images to PNG format." },
  { name: "PNG to JPG Converter", href: "/tools/png-to-jpg", icon: Replace, description: "Convert PNG images to JPG format." },
  { name: "WEBP to PNG Converter", href: "/tools/webp-to-png", icon: Replace, description: "Convert WEBP images to PNG format." },
  { name: "PNG to WEBP Converter", href: "/tools/png-to-webp", icon: Replace, description: "Convert PNG images to WEBP format." },
  { name: "JPG to WEBP Converter", href: "/tools/jpg-to-webp", icon: Replace, description: "Convert JPG images to WEBP format." },
  { name: "WEBP to JPG Converter", href: "/tools/webp-to-jpg", icon: Replace, description: "Convert WEBP images to JPG format." },
  { name: "Color Palette Generator", href: "/tools/color-palette-generator", icon: Palette, description: "Create color palettes from images." },
  { name: "Gradient Generator", href: "/tools/gradient-generator", icon: Layers, description: "Design and customize gradients." },
];

const financeCalculators = [
  { name: "Loan EMI Calculator", href: "/calculators/finance/loan-emi-calculator", icon: CalculatorIcon },
  { name: "Compound Interest Calculator", href: "/calculators/finance/compound-interest-calculator", icon: CalculatorIcon },
  { name: "Credit Card Payoff Calculator", href: "/calculators/finance/credit-card-payoff-calculator", icon: CalculatorIcon },
  { name: "Retirement Savings Calculator", href: "/calculators/finance/retirement-savings-calculator", icon: CalculatorIcon },
  { name: "Income Tax Calculator", href: "/calculators/finance/income-tax-calculator", icon: CalculatorIcon },
  { name: "Crypto Gains Tax Calculator", href: "/calculators/finance/crypto-gains-tax-calculator", icon: CalculatorIcon },
  { name: "Currency Exchange Rate Calculator", href: "/calculators/finance/currency-exchange-rate-calculator", icon: CalculatorIcon },
  { name: "Freelancer Hourly Rate Calculator", href: "/calculators/finance/freelancer-hourly-rate-calculator", icon: CalculatorIcon },
  { name: "Budget Planner Calculator", href: "/calculators/finance/budget-planner-calculator", icon: CalculatorIcon },
  { name: "Investment Return Calculator", href: "/calculators/finance/investment-return-calculator", icon: CalculatorIcon },
];

const aiContentCalculators = [
  { name: "Token Estimator", href: "/calculators/ai-content/token-estimator", icon: FileJson },
  { name: "Prompt Length Checker", href: "/calculators/ai-content/prompt-length-checker", icon: TextCursorInput },
  { name: "Content Readability Score", href: "/calculators/ai-content/content-readability-calculator", icon: BookOpenCheck },
  { name: "Keyword Density Calculator", href: "/calculators/ai-content/keyword-density-calculator", icon: Tags },
  { name: "Estimated Reading Time", href: "/calculators/ai-content/estimated-reading-time-calculator", icon: Timer },
];

const healthFitnessCalculators = [
  { name: "BMI Calculator", href: "/calculators/health-fitness/bmi-calculator", icon: Scale },
  { name: "BMR & Calorie Calculator", href: "/calculators/health-fitness/bmr-calorie-calculator", icon: Flame },
  { name: "Macros Calculator", href: "/calculators/health-fitness/macros-calculator", icon: PieChart },
  { name: "Ideal Weight Calculator", href: "/calculators/health-fitness/ideal-weight-calculator", icon: Target },
  { name: "Body Fat Percentage Calculator", href: "/calculators/health-fitness/body-fat-percentage-calculator", icon: Gauge },
  { name: "Water Intake Calculator", href: "/calculators/health-fitness/water-intake-calculator", icon: Droplet },
];

const travelLifestyleCalculators = [
  { name: "Trip Budget Calculator", href: "/calculators/travel-lifestyle/trip-budget-calculator", icon: Briefcase },
  { name: "Time Zone Converter", href: "/calculators/travel-lifestyle/time-zone-converter", icon: Globe },
  { name: "Flight CO2 Emissions Calculator", href: "/calculators/travel-lifestyle/flight-co2-emissions-calculator", icon: Leaf },
  { name: "Backpacking Weight Calculator", href: "/calculators/travel-lifestyle/backpacking-weight-calculator", icon: Backpack },
  { name: "Travel Days Countdown", href: "/calculators/travel-lifestyle/travel-days-countdown", icon: CalendarDays },
];

const ecommercePricingCalculators = [
  { name: "Product Pricing Calculator", href: "/calculators/ecommerce-pricing/product-pricing-calculator", icon: Tag },
  { name: "Discount Calculator", href: "/calculators/ecommerce-pricing/discount-calculator", icon: BadgePercent },
  { name: "Shipping Cost Estimator", href: "/calculators/ecommerce-pricing/shipping-cost-estimator", icon: Truck },
  { name: "Bulk Price Break Calculator", href: "/calculators/ecommerce-pricing/bulk-price-break-calculator", icon: Boxes },
  { name: "Etsy/Shopify Fee Calculator", href: "/calculators/ecommerce-pricing/etsy-shopify-fee-calculator", icon: BadgeDollarSign },
];

const businessTools = [
    { name: "Invoice Generator", href: "/business-tools/invoice-generator", icon: FileText, description: "Create and manage professional invoices." },
    { name: "Quotation Generator", href: "/business-tools/quotation-generator", icon: FilePlus, description: "Generate and send price quotes." },
    { name: "Business Plan Generator", href: "/business-tools/business-plan-generator", icon: FileSpreadsheet, description: "Develop a comprehensive business plan." },
    { name: "Terms & Conditions Generator", href: "/business-tools/terms-conditions-generator", icon: FileLock2, description: "Generate terms for your website/app." },
    { name: "Privacy Policy Generator", href: "/business-tools/privacy-policy-generator", icon: FileLock, description: "Create a privacy policy document." },
    { name: "NDAs & Legal Docs Generator", href: "/business-tools/legal-docs-generator", icon: FileSignature, description: "Generate NDAs and other legal docs." },
];


export default function Header() {
  return (
    <header className="py-6 bg-card border-b border-border shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-bold text-primary hover:text-primary/90 transition-colors">
          <Combine size={28} />
          <span>Toolbox AI</span>
        </Link>
        <nav className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Image Tools <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuLabel>Image Utilities</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {imageTools.map((tool) => (
                <DropdownMenuItem key={tool.name} asChild>
                  <Link href={tool.href} className="flex items-center gap-2 cursor-pointer">
                    <tool.icon size={16} className="text-muted-foreground" />
                    <span>{tool.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Calculators <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
              <DropdownMenuLabel>Calculation Tools</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Landmark size={16} className="mr-2 text-muted-foreground" />
                  <span>Finance &amp; Money</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-64">
                    <DropdownMenuLabel>Finance Tools</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {financeCalculators.map((tool) => (
                      <DropdownMenuItem key={tool.name} asChild>
                        <Link href={tool.href} className="flex items-center gap-2 cursor-pointer">
                          <tool.icon size={16} className="text-muted-foreground" />
                          <span>{tool.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Brain size={16} className="mr-2 text-muted-foreground" />
                  <span>AI &amp; Content Creation</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-72">
                    <DropdownMenuLabel>AI & Content Tools</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {aiContentCalculators.map((tool) => (
                      <DropdownMenuItem key={tool.name} asChild>
                        <Link href={tool.href} className="flex items-center gap-2 cursor-pointer">
                          <tool.icon size={16} className="text-muted-foreground" />
                          <span>{tool.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <HeartPulse size={16} className="mr-2 text-muted-foreground" />
                  <span>Health &amp; Fitness</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-72">
                    <DropdownMenuLabel>Health & Fitness Tools</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {healthFitnessCalculators.map((tool) => (
                      <DropdownMenuItem key={tool.name} asChild>
                        <Link href={tool.href} className="flex items-center gap-2 cursor-pointer">
                          <tool.icon size={16} className="text-muted-foreground" />
                          <span>{tool.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Plane size={16} className="mr-2 text-muted-foreground" /> 
                  <span>Travel &amp; Lifestyle</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-72">
                    <DropdownMenuLabel>Travel & Lifestyle Tools</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {travelLifestyleCalculators.map((tool) => (
                      <DropdownMenuItem key={tool.name} asChild>
                        <Link href={tool.href} className="flex items-center gap-2 cursor-pointer">
                          <tool.icon size={16} className="text-muted-foreground" />
                          <span>{tool.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <ShoppingCart size={16} className="mr-2 text-muted-foreground" /> 
                  <span>E-Commerce &amp; Pricing</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-72">
                    <DropdownMenuLabel>E-Commerce & Pricing Tools</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {ecommercePricingCalculators.map((tool) => (
                      <DropdownMenuItem key={tool.name} asChild>
                        <Link href={tool.href} className="flex items-center gap-2 cursor-pointer">
                          <tool.icon size={16} className="text-muted-foreground" />
                          <span>{tool.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Business Tools <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
              <DropdownMenuLabel>Business Utilities</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {businessTools.map((tool) => (
                <DropdownMenuItem key={tool.name} asChild>
                  <Link href={tool.href} className="flex items-center gap-2 cursor-pointer">
                    <tool.icon size={16} className="text-muted-foreground" />
                    <span>{tool.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

        </nav>
      </div>
    </header>
  );
}
