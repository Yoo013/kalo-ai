import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { messages } = await req.json();

    // Build a single prompt from the conversation history
    const systemParts = messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n');
    const history = messages.filter(m => m.role !== 'system');
    const historyText = history.map(m => `${m.role === 'user' ? 'AGENT' : 'CUSTOMER'}: ${m.content}`).join('\n');

    const prompt = `${systemParts}\n\n--- Conversation so far ---\n${historyText}\n\nNow respond as the CUSTOMER. Be realistic, skeptical, and stay in character. Keep your response under 3 sentences.`;

    const reply = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });

    return Response.json({ reply });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});