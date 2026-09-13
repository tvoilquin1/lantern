type JsonObject = Record<string, unknown>;

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface SupabaseResult<T> {
  data: T | null;
  error: SupabaseError | null;
}

type QueryValue = string | number | boolean | null;

interface SupabaseRequestInit extends RequestInit {
  body?: BodyInit | null;
}

class SupabaseTableClient<Row extends JsonObject> {
  private readonly filters = new URLSearchParams();

  public constructor(
    private readonly baseUrl: string,
    private readonly headers: HeadersInit,
    private readonly table: string,
  ) {}

  public eq(column: string, value: QueryValue): this {
    this.filters.set(column, `eq.${value ?? 'null'}`);
    return this;
  }

  public async select(columns = '*'): Promise<SupabaseResult<Row[]>> {
    const params = new URLSearchParams(this.filters);
    params.set('select', columns);

    return this.request<Row[]>(`?${params.toString()}`);
  }

  public async insert(values: Partial<Row> | Partial<Row>[]): Promise<SupabaseResult<Row[]>> {
    return this.request<Row[]>('', {
      method: 'POST',
      headers: { ...this.headers, Prefer: 'return=representation' },
      body: JSON.stringify(values),
    });
  }

  public async update(values: Partial<Row>): Promise<SupabaseResult<Row[]>> {
    const params = new URLSearchParams(this.filters);

    return this.request<Row[]>(`?${params.toString()}`, {
      method: 'PATCH',
      headers: { ...this.headers, Prefer: 'return=representation' },
      body: JSON.stringify(values),
    });
  }

  public async delete(): Promise<SupabaseResult<Row[]>> {
    const params = new URLSearchParams(this.filters);

    return this.request<Row[]>(`?${params.toString()}`, {
      method: 'DELETE',
      headers: { ...this.headers, Prefer: 'return=representation' },
    });
  }

  private async request<Result>(
    suffix: string,
    init: SupabaseRequestInit = {},
  ): Promise<SupabaseResult<Result>> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/v1/${this.table}${suffix}`, {
        ...init,
        headers: { ...this.headers, ...init.headers },
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          data: null,
          error: {
            message: payload?.message ?? `Supabase request failed with status ${response.status}`,
            details: payload?.details,
            hint: payload?.hint,
            code: payload?.code,
          },
        };
      }

      return { data: payload as Result, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Supabase request failed',
        },
      };
    }
  }
}

export class SupabaseRestClient {
  private readonly baseUrl: string;
  private readonly headers: HeadersInit;

  public constructor(url: string, anonKey: string) {
    this.baseUrl = url.replace(/\/$/, '');
    this.headers = {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    };
  }

  public from<Row extends JsonObject = JsonObject>(table: string): SupabaseTableClient<Row> {
    return new SupabaseTableClient<Row>(this.baseUrl, this.headers, table);
  }
}

export function createSupabaseRestClient(): SupabaseRestClient {
  return new SupabaseRestClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  );
}
