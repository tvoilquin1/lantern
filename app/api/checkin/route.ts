import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { buildSystemPrompt } from '@/lib/companion/systemPrompt';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STAGE_ID_TO_NAME: Record<number, 'early' | 'middle' | 'late'> = {
  1: 'early',
  2: 'middle',
  3: 'late',
};

/**
 * GET returns today's daily check-in session (written by the cron in
 * app/api/cron/daily-checkin) if one exists, plus enough context for the
 * check-in screen to render. Returns session: null when nothing is
 * scheduled or today's check-in was already completed — the screen renders
 * a calm "nothing waiting" state rather than a form (see design_system/readme.md
 * product principle 4: no gamification, no manufactured urgency).
 */
export async function GET() {
  const supabase = createClient();
  const scheduledFor = new Date().toISOString().slice(0, 10);

  const [{ data: session, error: sessionError }, { data: profile }, { data: lastSummary }] = await Promise.all([
    supabase
      .from('sessions')
      .select('id,status,scheduled_for')
      .eq('kind', 'daily_checkin')
      .eq('scheduled_for', scheduledFor)
      .maybeSingle(),
    supabase.from('patient_profile').select('stage_id').limit(1).maybeSingle(),
    supabase
      .from('sessions')
      .select('summary')
      .not('summary', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (sessionError) {
    console.error("[api/checkin] failed to load today's session", sessionError);
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  return NextResponse.json({
    session,
    patientStageId: profile?.stage_id ?? null,
    lastSessionSummary: lastSummary?.summary ?? null,
  });
}

type StartRequestBody = { sessionId: string; lastSessionSummary?: string | null };

/**
 * POST marks the pending session active and generates the companion's
 * opening line — a question about the caregiver's night/morning, never a
 * form (PRD P0-3 acceptance criteria). The reply is returned as plain text
 * so the client can seed it as the first message before handing off to the
 * normal streaming /api/chat for the rest of the conversation.
 */
export async function POST(req: Request) {
  const { sessionId, lastSessionSummary = null } = (await req.json()) as StartRequestBody;

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
  }

  const supabase = createClient();

  const [{ data: updatedSession, error: updateError }, { data: profile }] = await Promise.all([
    supabase.from('sessions').update({ status: 'active' }).eq('id', sessionId).select('id').maybeSingle(),
    supabase.from('patient_profile').select('stage_id').limit(1).maybeSingle(),
  ]);

  if (updateError) {
    console.error('[api/checkin] failed to activate session', updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (!updatedSession) {
    return NextResponse.json({ error: 'session not found' }, { status: 404 });
  }

  const patientStageId = profile?.stage_id ?? null;

  const system = buildSystemPrompt({
    patientStage: patientStageId ? (STAGE_ID_TO_NAME[patientStageId] ?? null) : null,
    lastSessionSummary: lastSessionSummary ?? null,
    ragContext: null,
    lcwsLevel: null,
    sessionKind: 'daily_checkin',
  });

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    system,
    prompt: "Begin today's check-in now with your opening question.",
  });

  return NextResponse.json({ message: text });
}
