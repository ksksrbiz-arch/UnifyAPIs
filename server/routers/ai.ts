import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import Groq from 'groq-sdk';

let groqClient: Groq | null = null;
function getGroqClient() {
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
}

export const aiRouter = createTRPCRouter({
  recommendAPIs: protectedProcedure
    .input(z.object({ useCase: z.string().min(10).max(500) }))
    .mutation(async ({ ctx, input }) => {
      const allApis = await ctx.db.query.apis.findMany({
        columns: { id: true, name: true, description: true, category: true, tags: true },
      });

      const catalog = allApis
        .map((a) => `- ${a.name} (${a.category}): ${a.description}`)
        .join('\n');

      const completion = await getGroqClient().chat.completions.create({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content:
              'You are an API recommendation expert. Given a user\'s use case, recommend the most suitable APIs from the catalog. Return a JSON array of API names with a brief reason for each.',
          },
          {
            role: 'user',
            content: `Use case: ${input.useCase}\n\nAvailable APIs:\n${catalog}\n\nRecommend the best 3 APIs. Return JSON: [{"name":"...", "reason":"..."}]`,
          },
        ],
        temperature: 0.7,
        max_tokens: 512,
      });

      const text = completion.choices[0]?.message?.content ?? '[]';
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        const recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
        return { recommendations };
      } catch {
        return { recommendations: [], raw: text };
      }
    }),

  generateCodeSnippet: protectedProcedure
    .input(
      z.object({
        apiId: z.string().uuid(),
        language: z.enum(['javascript', 'python', 'curl']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const api = await ctx.db.query.apis.findFirst({
        where: (a, { eq }) => eq(a.id, input.apiId),
      });

      if (!api) throw new TRPCError({ code: 'NOT_FOUND', message: 'API not found' });

      const userApi = await ctx.db.query.userApis.findFirst({
        where: (ua, { eq, and }) =>
          and(
            eq(ua.apiId, input.apiId),
            eq(ua.userId, ctx.session.user.id)
          ),
      });

      const notesContext = userApi?.notes
        ? `\nUser notes about this API: ${userApi.notes}`
        : '';

      const completion = await getGroqClient().chat.completions.create({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are a code generation assistant. Generate clean, working ${input.language} code snippets for API calls.`,
          },
          {
            role: 'user',
            content: `Generate a ${input.language} code snippet to call the ${api.name} API.
API base URL: ${api.baseUrl}
Example endpoint: ${api.exampleEndpoint}
Docs: ${api.docsUrl}
${notesContext}

Return only the code snippet, no explanation.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 512,
      });

      const snippet = completion.choices[0]?.message?.content ?? '';
      return { snippet, language: input.language };
    }),
});
