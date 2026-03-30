import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, speaker, fullTranscript } = await req.json();

    const transcriptSummary = (fullTranscript || [])
      .slice(-10)
      .map(t => `${t.speaker}: ${t.text}`)
      .join('\n');

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an elite real-time sales coach. Analyze this sales call segment.

Recent conversation:
${transcriptSummary}

Latest (${speaker}): "${text}"

Return a JSON analysis with coaching for the agent.`,
      response_json_schema: {
        type: "object",
        properties: {
          objection: {
            type: "object",
            properties: {
              detected: { type: "boolean" },
              category: { type: "string" },
              suggested_response: { type: "string" }
            }
          },
          suggestion: { type: "string" },
          tone: {
            type: "object",
            properties: {
              agent_tone: { type: "string" },
              confidence_score: { type: "number" },
              energy_level: { type: "string" }
            }
          },
          closing_probability: { type: "number" },
          stage: { type: "string" },
          extracted_info: {
            type: "object",
            properties: {
              debt_amount: { type: "string" },
              income: { type: "string" },
              key_detail: { type: "string" }
            }
          }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});