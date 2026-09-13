import { createSupabaseRestClient, SupabaseRestClient } from './rest-client';

export function createServerClient(): SupabaseRestClient {
  return createSupabaseRestClient();
}

export const supabase = createServerClient();
