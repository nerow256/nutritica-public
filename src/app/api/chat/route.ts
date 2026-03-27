import { NextRequest } from 'next/server';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=`;
const CHAT_TIMEOUT = 60_000;
const MODELS_TIMEOUT = 5_000;

// Check if Ollama is reachable (cached for 30s)
let ollamaOnlineCache: { value: boolean; ts: number } = { value: false, ts: 0 };
async function isOllamaOnline(): Promise<boolean> {
  if (Date.now() - ollamaOnlineCache.ts < 30_000) return ollamaOnlineCache.value;
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), MODELS_TIMEOUT);
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: ctrl.signal });
    clearTimeout(tid);
    ollamaOnlineCache = { value: res.ok, ts: Date.now() };
    return res.ok;
  } catch {
    ollamaOnlineCache = { value: false, ts: Date.now() };
    return false;
  }
}

// ── Gemini streaming ────────────────────────────────────────────────────────
async function streamGemini(
  messages: { role: string; content: string; images?: string[] }[],
): Promise<Response> {
  const encoder = new TextEncoder();

  // Convert messages to Gemini format
  // Gemini uses "user" and "model" roles, and system goes in systemInstruction
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');

  const geminiContents = chatMessages.map(m => {
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: m.content },
    ];
    // Attach images if present
    if (m.images?.length) {
      for (const img of m.images) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: img } });
      }
    }
    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts,
    };
  });

  const body: Record<string, unknown> = {
    contents: geminiContents,
    generationConfig: { maxOutputTokens: 2048 },
  };
  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] };
  }

  const geminiRes = await fetch(`${GEMINI_URL}${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!geminiRes.ok) {
    const err = await geminiRes.text();
    console.error('[chat] Gemini error:', err);
    return Response.json({ error: 'Gemini request failed' }, { status: geminiRes.status });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = geminiRes.body?.getReader();
      if (!reader) { controller.close(); return; }
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (!data) continue;
            try {
              const parsed = JSON.parse(data);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`)
                );
              }
              // Check if generation is done
              const finishReason = parsed.candidates?.[0]?.finishReason;
              if (finishReason && finishReason !== 'STOP') {
                // Could be SAFETY, MAX_TOKENS, etc.
              }
            } catch { /* skip malformed */ }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (err) {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch { /* already closed */ }
        console.error('[chat] Gemini stream error:', err instanceof Error ? err.message : 'Unknown');
      } finally {
        try { reader.releaseLock(); } catch { /* */ }
        try { controller.close(); } catch { /* already closed */ }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// ── Ollama streaming ────────────────────────────────────────────────────────
async function streamOllama(
  messages: { role: string; content: string; images?: string[] }[],
  model: string,
): Promise<Response> {
  const encoder = new TextEncoder();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CHAT_TIMEOUT);

  const ollamaRes = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      options: { num_ctx: 4096 },
    }),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  if (!ollamaRes.ok) {
    return Response.json({ error: 'Ollama request failed' }, { status: ollamaRes.status });
  }

  const stream = new ReadableStream({
    async start(ctrl) {
      const reader = ollamaRes.body?.getReader();
      if (!reader) { ctrl.close(); return; }
      const decoder = new TextDecoder();
      let thinkingSent = false;
      let streamTimeout: ReturnType<typeof setTimeout> | null = null;
      const resetStreamTimeout = () => {
        if (streamTimeout) clearTimeout(streamTimeout);
        streamTimeout = setTimeout(() => {
          try {
            ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream timeout' })}\n\n`));
            ctrl.enqueue(encoder.encode('data: [DONE]\n\n'));
            ctrl.close();
          } catch { /* */ }
          reader.cancel().catch(() => {});
        }, 30_000);
      };

      try {
        resetStreamTimeout();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          resetStreamTimeout();
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              if (parsed.message?.thinking && !parsed.message?.content) {
                if (!thinkingSent) {
                  ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ thinking: true })}\n\n`));
                  thinkingSent = true;
                }
              } else if (parsed.message?.content) {
                ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ content: parsed.message.content })}\n\n`));
              }
              if (parsed.done) {
                ctrl.enqueue(encoder.encode('data: [DONE]\n\n'));
              }
            } catch { /* skip malformed */ }
          }
        }
      } catch (err) {
        try {
          const errorMsg = err instanceof DOMException && err.name === 'AbortError'
            ? 'Stream aborted' : 'Stream interrupted';
          ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMsg })}\n\n`));
          ctrl.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch { /* */ }
        console.error('[chat] Ollama stream error:', err instanceof Error ? err.message : 'Unknown');
      } finally {
        if (streamTimeout) clearTimeout(streamTimeout);
        try { reader.releaseLock(); } catch { /* */ }
        try { ctrl.close(); } catch { /* */ }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// ── POST /api/chat ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    let body;
    try { body = await req.json(); } catch {
      return Response.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    const { messages, model, images } = body;

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 200) {
      return Response.json({ error: 'Invalid messages' }, { status: 400 });
    }

    const safeModel = typeof model === 'string' ? model.slice(0, 100) : 'gemma3:4b';

    const safeMessages = messages.map((m: { role: string; content: string; images?: string[] }) => {
      const msg: { role: string; content: string; images?: string[] } = {
        role: ['user', 'assistant', 'system'].includes(m.role) ? m.role : 'user',
        content: typeof m.content === 'string' ? m.content.slice(0, 10000) : '',
      };
      return msg;
    });

    // Attach images to last user message
    if (Array.isArray(images) && images.length > 0 && images.length <= 5) {
      const lastUserIdx = safeMessages.findLastIndex((m: { role: string }) => m.role === 'user');
      if (lastUserIdx >= 0) {
        safeMessages[lastUserIdx].images = images.filter((img: unknown) => typeof img === 'string').slice(0, 5);
      }
    }

    // Check if this is a Gemini model request
    const useGemini = safeModel.startsWith('gemini:');

    if (useGemini) {
      if (!GEMINI_API_KEY) {
        return Response.json({ error: 'Gemini API key not configured' }, { status: 503 });
      }
      return streamGemini(safeMessages);
    }

    // Try Ollama
    try {
      return await streamOllama(safeMessages, safeModel);
    } catch {
      // Ollama failed — fall back to Gemini if available
      if (GEMINI_API_KEY) {
        console.log('[chat] Ollama unavailable, falling back to Gemini');
        return streamGemini(safeMessages);
      }
      return Response.json(
        { error: 'Failed to connect to Ollama. Make sure it\'s running.' },
        { status: 503 }
      );
    }
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── GET /api/chat — list available models ───────────────────────────────────
export async function GET() {
  const ollamaOnline = await isOllamaOnline();
  const models: { name: string; size: number; provider: string }[] = [];

  // Add Ollama models if available
  if (ollamaOnline) {
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/tags`);
      const data = await res.json();
      for (const m of data.models || []) {
        models.push({ name: m.name, size: m.size, provider: 'ollama' });
      }
    } catch { /* skip */ }
  }

  // Always add Gemini if API key is set
  if (GEMINI_API_KEY) {
    models.push({ name: `gemini:${GEMINI_MODEL}`, size: 0, provider: 'gemini' });
  }

  if (models.length === 0) {
    return Response.json({ models: [], error: 'No AI providers available' }, { status: 503 });
  }

  return Response.json({ models, ollamaOnline, geminiAvailable: !!GEMINI_API_KEY });
}
