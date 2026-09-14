import { anthropic } from '@ai-sdk/anthropic';
import { createDataStreamResponse, formatDataStreamPart, streamText, type CoreMessage } from 'ai';
import { CRISIS_RESPONSE, checkCrisisKeywords, flagCrisisTool } from '@/lib/companion/crisis';
import { logPatientObservationTool } from '@/lib/companion/tools';
import { buildSystemPrompt } from '@/lib/companion/systemPrompt';
import { retrieve } from '@/lib/retrieval/retrieve';

export const runtime = 'nodejs';

const STAGE_ID_TO_NAME: Record<number, 'early' | 'middle' | 'late'> = {
  1: 'early',
  2: 'middle',
  3: 'late',
};

type ChatRequestBody = {
  messages: CoreMessage[];
  sessionId?: string | null;
  patientStageId?: number | null;
  lastSessionSummary?: string | null;
  lcwsLevel?: number | null;
};

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequestBody;
  const { messages, patientStageId = null, lastSessionSummary = null, lcwsLevel = null } = body;

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
  const lastUserText =
    typeof lastUserMessage?.content === 'string'
      ? lastUserMessage.content
      : Array.isArray(lastUserMessage?.content)
        ? (lastUserMessage.content as Array<{ type: string; text?: string }>)
            .filter((p) => p.type === 'text' && typeof p.text === 'string')
            .map((p) => p.text as string)
            .join(' ')
        : '';

  if (checkCrisisKeywords(lastUserText)) {
    return createDataStreamResponse({
      execute: (dataStream) => {
        dataStream.write(formatDataStreamPart('text', CRISIS_RESPONSE));
      },
    });
  }

  const retrievedChunks = await retrieve(lastUserText, patientStageId ?? undefined, 3);
  const ragContext = retrievedChunks.length > 0 ? retrievedChunks.map((c) => c.content).join('\n\n') : null;

  const system = buildSystemPrompt({
    patientStage: patientStageId ? (STAGE_ID_TO_NAME[patientStageId] ?? null) : null,
    lastSessionSummary,
    ragContext,
    lcwsLevel,
  });

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const result = streamText({
        model: anthropic('claude-sonnet-4-6'),
        system,
        messages,
        maxSteps: 3,
        tools: {
          flag_crisis: flagCrisisTool,
          log_patient_observation: logPatientObservationTool,
        },
      });

      for await (const part of result.fullStream) {
        if (part.type === 'text-delta') {
          dataStream.write(formatDataStreamPart('text', part.textDelta));
        } else if (part.type === 'tool-call' && part.toolName === 'flag_crisis') {
          dataStream.write(formatDataStreamPart('text', CRISIS_RESPONSE));
          return;
        } else if (part.type === 'tool-call') {
          dataStream.write(
            formatDataStreamPart('tool_call', {
              toolCallId: part.toolCallId,
              toolName: part.toolName,
              args: part.args,
            }),
          );
        } else if (part.type === 'error') {
          throw part.error;
        }
      }
    },
  });
}
