
'use server';
/**
 * @fileOverview An AI-powered customer persona generator.
 *
 * - generateCustomerPersona - A function that handles the customer persona generation process.
 * - GenerateCustomerPersonaInput - The input type for the generateCustomerPersona function.
 * - GenerateCustomerPersonaOutput - The return type for the generateCustomerPersona function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateCustomerPersonaInputSchema = z.object({
  businessType: z.string().min(3, "Business type is required (min 3 characters).").describe("Type of business (e.g., e-commerce, SaaS, local coffee shop, B2B software)."),
  productOrService: z.string().min(10, "Product/service description is required (min 10 characters).").describe("Brief description of the main product or service offered by the business."),
  targetAudienceGoals: z.string().min(10, "Audience goals are required (min 10 characters).").describe("What does the ideal customer want to achieve by using this product/service or in general? (e.g., 'increase productivity', 'find unique gifts', 'improve health')."),
  targetAudienceChallenges: z.string().min(10, "Audience challenges are required (min 10 characters).").describe("Key problems, pain points, or frustrations the ideal customer faces that this product/service can address (e.g., 'wasting time on manual tasks', 'difficulty finding reliable information', 'high costs of current solutions')."),
  additionalInfo: z.string().optional().describe("Any other relevant information about the target audience, market context, or specific aspects to focus on (e.g., 'they are budget-conscious', 'primarily active on Instagram', 'value sustainability')."),
});
export type GenerateCustomerPersonaInput = z.infer<typeof GenerateCustomerPersonaInputSchema>;

const PersonaDemographicsSchema = z.object({
  ageRange: z.string().describe("Typical age range of the persona (e.g., '28-38 years', '45-55')."),
  occupation: z.string().describe("Common occupation, job title, or role of the persona (e.g., 'Marketing Manager', 'Freelance Graphic Designer', 'Stay-at-home Parent')."),
  educationLevel: z.string().optional().describe("Typical education level (e.g., 'Bachelor's Degree in Business', 'High School Diploma', 'PhD in Engineering')."),
  location: z.string().optional().describe("Geographic location or type of area they reside or work in (e.g., 'Urban tech hubs in North America', 'Suburban areas with young families', 'Remote/Global')."),
  keyCharacteristics: z.array(z.string()).optional().min(1).describe("List of 2-3 key personality traits or characteristics (e.g., 'Tech-savvy', 'Detail-oriented', 'Family-focused').")
});

export const GenerateCustomerPersonaOutputSchema = z.object({
  personaName: z.string().describe("A catchy, fictional, and descriptive name for the persona (e.g., 'Ambitious Alex', 'Creative Clara', 'Practical Pete'). Should ideally alliterate or be memorable."),
  demographics: PersonaDemographicsSchema.describe("Key demographic details of the persona."),
  goals: z.array(z.string()).min(2).max(4).describe("List of 2-4 primary goals of this persona, directly related to or addressable by the business's product/service."),
  challenges: z.array(z.string()).min(2).max(4).describe("List of 2-4 main challenges or pain points this persona faces, which the product/service aims to solve."),
  motivations: z.array(z.string()).min(2).max(4).describe("What drives this persona's decisions and behaviors in the context of the product/service (e.g., 'Achieving career growth', 'Saving time and effort', 'Gaining recognition', 'Ensuring family well-being')."),
  howProductHelps: z.string().describe("A concise explanation of how the user's product/service specifically addresses the persona's challenges and helps them achieve their goals."),
  marketingChannels: z.array(z.string()).min(2).max(4).describe("List of 2-4 most effective channels or platforms to reach this persona (e.g., 'LinkedIn ads', 'Industry-specific forums', 'Instagram influencers', 'Email newsletters')."),
  preferredContent: z.array(z.string()).min(2).max(4).describe("Types of content the persona prefers to consume when researching solutions or engaging with brands (e.g., 'In-depth case studies', 'Quick video tutorials', 'Interactive webinars', 'Blog posts with actionable tips')."),
  quote: z.string().describe("A short, impactful, and representative quote (1-2 sentences) that encapsulates the persona's main sentiment, need, or perspective related to the business context."),
});
export type GenerateCustomerPersonaOutput = z.infer<typeof GenerateCustomerPersonaOutputSchema>;

export async function generateCustomerPersona(input: GenerateCustomerPersonaInput): Promise<GenerateCustomerPersonaOutput> {
  return generateCustomerPersonaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCustomerPersonaPrompt',
  input: {schema: GenerateCustomerPersonaInputSchema},
  output: {schema: GenerateCustomerPersonaOutputSchema},
  prompt: `You are an expert marketing strategist specializing in creating detailed and actionable customer personas.
Based on the following information about a business and its target audience, generate a comprehensive customer persona.

Business Information:
- Type: {{{businessType}}}
- Product/Service: {{{productOrService}}}

Target Audience Insights:
- Goals: {{{targetAudienceGoals}}}
- Challenges: {{{targetAudienceChallenges}}}
{{#if additionalInfo}}- Additional Context: {{{additionalInfo}}}{{/if}}

Your task is to synthesize this information into a single, well-defined customer persona. The persona should be fictional but grounded in the provided details.
Focus on making the persona insightful and useful for marketing and product development decisions.

The persona should include:
1.  **Persona Name**: A catchy, memorable name (e.g., "Budget-Conscious Ben," "Tech-Savvy Tina").
2.  **Demographics**: Age range, typical occupation, education level (if inferable), and location type. Include 2-3 key characteristics.
3.  **Goals**: 2-4 primary goals directly relevant to the product/service.
4.  **Challenges**: 2-4 main pain points or frustrations the product/service can solve.
5.  **Motivations**: What drives their decisions (2-4 items).
6.  **How Product/Service Helps**: A concise explanation.
7.  **Marketing Channels**: 2-4 effective channels to reach them.
8.  **Preferred Content**: 2-4 types of content they engage with.
9.  **Quote**: A representative quote (1-2 sentences) from the persona's perspective.

Please ensure the output strictly adheres to the JSON schema provided for GenerateCustomerPersonaOutput.
Generate one complete persona.
`,
});

const generateCustomerPersonaFlow = ai.defineFlow(
  {
    name: 'generateCustomerPersonaFlow',
    inputSchema: GenerateCustomerPersonaInputSchema,
    outputSchema: GenerateCustomerPersonaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate a persona. The output was empty.");
    }
    // Basic validation to ensure key fields are present, though Zod handles schema validation
    if (!output.personaName || !output.demographics || !output.goals || output.goals.length === 0) {
        throw new Error("Generated persona is incomplete. Missing critical fields like name, demographics, or goals.");
    }
    return output;
  }
);
