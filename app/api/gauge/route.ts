import { NextResponse } from 'next/server';
import { classifyGaugeColor } from '@/lib/companion/burnout';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Minimal gauge-state surface for the Phase 5 dev preview (app/gauge-preview) —
 * not the Phase 6 dashboard, which is out of scope here. Read-only.
 */
export async function GET() {
  const supabase = createClient();

  const { data: state, error } = await supabase
    .from('caregiver_state')
    .select(
      'burnout_score_current,burnout_score_baseline,score_history,missed_checkin_streak,level2_support_pending,level2_support_surfaced_at,emergency_contact_outreach_triggered_at,last_check_in_at,last_lcws_at',
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[api/gauge] failed to load caregiver_state', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!state) {
    return NextResponse.json({ state: null });
  }

  const score = state.burnout_score_current as number | null;

  return NextResponse.json({
    state: {
      ...state,
      color: score != null ? classifyGaugeColor(score) : null,
    },
  });
}
