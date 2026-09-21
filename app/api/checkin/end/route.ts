import { NextResponse } from 'next/server';
import type { CoreMessage } from 'ai';
import { summarizeAndScoreSession } from '@/lib/companion/sessionEnd';
import { aggregateSessionSignals } from '@/lib/companion/burnout';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type EndRequestBody = {
  sessionId: string;
  messages: CoreMessage[];
};

/**
 * Ends a daily check-in session: computes the rolling summary + self-report
 * sentiment score server-side (Phase 5 brief — never in real time during the
 * conversation), marks the session completed, and runs post-session signal
 * aggregation (lib/companion/burnout.ts). No raw transcript is persisted —
 * only the resulting summary and score.
 */
export async function POST(req: Request) {
  const { sessionId, messages } = (await req.json()) as EndRequestBody;

  if (!sessionId || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'sessionId and messages are required' }, { status: 400 });
  }

  const supabase = createClient();

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('id,status,created_at')
    .eq('id', sessionId)
    .maybeSingle();

  if (sessionError || !session) {
    console.error('[api/checkin/end] session not found', sessionError);
    return NextResponse.json({ error: 'session not found' }, { status: 404 });
  }

  if (session.status === 'completed') {
    // Idempotent — a re-submitted "done" click should not double-aggregate.
    return NextResponse.json({ status: 'already_completed' });
  }

  const { summary, sentimentScore } = await summarizeAndScoreSession(messages);

  await supabase.from('sessions').update({ status: 'completed', summary }).eq('id', sessionId);

  const result = await aggregateSessionSignals({
    supabase,
    sessionId,
    sentimentScore,
    sessionCreatedAt: session.created_at as string,
  });

  return NextResponse.json({ status: 'completed', gauge: result });
}
