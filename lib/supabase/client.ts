"use client";

import { createSupabaseRestClient, SupabaseRestClient } from './rest-client';

let browserClient: SupabaseRestClient | undefined;

export function createClient(): SupabaseRestClient {
  browserClient ??= createSupabaseRestClient();
  return browserClient;
}

export const supabase = createClient();
