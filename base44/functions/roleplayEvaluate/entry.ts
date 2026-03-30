import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { transcript } = await req.json();

    const transcriptText = transcript
      .map(m => `${m.role === 'user' ? 'AGENT' : 'CUSTOMER'}: ${m.content}`)
      .join('\n');

    const evaluation = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Evaluate this sales roleplay conversation. Score from 1-100.\n\nConversation:\n${transcriptText}`,
      response_json_schema: {
        type: "object",
        properties: {
          score: { type: "number" },
          rapport: { type: "number" },
          objectionHandling: { type: "number" },
          closing: { type: "number" },
          feedback: { type: "array", items: { type: "string" } }
        }
      }
    });

    return Response.json(evaluation);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});