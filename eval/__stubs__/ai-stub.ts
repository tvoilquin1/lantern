// Self-contained stubs matching AI SDK v4 interfaces.
// Must not re-export from 'ai' — that package is aliased to this file, so
// any `from 'ai'` here would resolve back to this file (circular).

export function formatDataStreamPart(type: string, content: string): string {
  if (type === 'text') {
    return `0:${JSON.stringify(content)}\n`;
  }
  return '';
}

export function createDataStreamResponse({
  execute,
}: {
  execute: (dataStream: { write: (part: string) => void }) => void | Promise<void>;
}): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const dataStream = {
        write(part: string) {
          controller.enqueue(encoder.encode(part));
        },
      };
      try {
        await execute(dataStream);
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export function tool<T>(definition: T): T {
  return definition;
}

export const MOCK_STREAM_TEXT_RESPONSE = 'Mock companion guidance for caregiving question';

let streamTextCallCount = 0;

export function __resetStreamTextCallCount(): void {
  streamTextCallCount = 0;
}

export function __getStreamTextCallCount(): number {
  return streamTextCallCount;
}

export function streamText(_options: unknown): {
  fullStream: AsyncIterable<{ type: 'text-delta'; textDelta: string }>;
} {
  streamTextCallCount++;
  return {
    fullStream: (async function* () {
      yield { type: 'text-delta' as const, textDelta: MOCK_STREAM_TEXT_RESPONSE };
    })(),
  };
}
