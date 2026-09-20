import { NextResponse } from 'next/server';
import { createSupabaseRestClient } from '@/lib/supabase/rest-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SessionRow = { id: string; status: string; kind: string; scheduled_for: string };

/**
 * Vercel cron target (see vercel.json) — writes a pending daily check-in
 * record to `sessions` each morning. The app shows it as a waiting message
 * next time the caregiver opens /checkin (Ref/phase-3-prd.md §P0-3 notes:
 * "a Vercel cron writes a pending check-in record; the app shows it as a
 * waiting message when the caregiver opens the app" — no push notification).
 *
 * MVP default check-in time is a literal 8am UTC (see vercel.json); timezone-
 * aware scheduling is P1 (P1-2), not built here.
 */
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const isDeployed = process.env.VERCEL_ENV != null || process.env.NODE_ENV === 'production';
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  } else if (isDeployed) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const scheduledFor = new Date().toISOString().slice(0, 10);
  const supabase = createSupabaseRestClient();

  const { data: existing, error: selectError } = await supabase
    .from<SessionRow>('sessions')
    .eq('kind', 'daily_checkin')
    .eq('scheduled_for', scheduledFor)
    .select('id');

  if (selectError) {
    console.error('[cron/daily-checkin] failed to check for existing session', selectError);
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }

  if (existing && existing.length > 0) {
    return NextResponse.json({ status: 'already_scheduled', scheduledFor, sessionId: existing[0]!.id });
  }

  const { data: inserted, error: insertError } = await supabase.from<SessionRow>('sessions').insert({
    status: 'pending',
    kind: 'daily_checkin',
    scheduled_for: scheduledFor,
  });

  if (insertError) {
    // The partial unique index (sessions_daily_checkin_once_per_day) can reject
    // a duplicate insert from a near-simultaneous cron retry — treat that as success.
    if (insertError.code === '23505') {
      return NextResponse.json({ status: 'already_scheduled', scheduledFor });
    }
    console.error('[cron/daily-checkin] failed to write pending check-in session', insertError);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'scheduled', scheduledFor, sessionId: inserted?.[0]?.id ?? null });
}
