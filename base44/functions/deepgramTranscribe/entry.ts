import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// This function returns a Deepgram WebSocket URL + token for the frontend to connect directly
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const DEEPGRAM_API_KEY = Deno.env.get("DEEPGRAM_API_KEY");
    if (!DEEPGRAM_API_KEY) {
      return Response.json({ error: 'DEEPGRAM_API_KEY not configured', demo: true }, { status: 200 });
    }

    // Return the key so frontend can open its own Deepgram WebSocket
    // (Deepgram supports direct browser WebSocket connections)
    return Response.json({ apiKey: DEEPGRAM_API_KEY });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});