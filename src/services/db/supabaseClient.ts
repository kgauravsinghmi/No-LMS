/**
 * Supabase & Remote REST Database Client Singleton
 * Handles connection checks, environment configuration, and authenticated REST requests
 * with automatic fallback to offline local mode.
 */

export interface DbConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConfigured: boolean;
  timeoutMs: number;
}

export interface DbConnectionStatus {
  connected: boolean;
  mode: 'remote' | 'offline';
  latencyMs?: number;
  error?: string;
  endpoint?: string;
}

class DatabaseClient {
  private config: DbConfig;
  private connectionCache: { status: DbConnectionStatus; timestamp: number } | null = null;
  private readonly CACHE_TTL_MS = 15000; // 15s cache for health status

  constructor() {
    const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
    const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

    this.config = {
      supabaseUrl: supabaseUrl.replace(/\/$/, ''),
      supabaseAnonKey,
      isConfigured: Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project')),
      timeoutMs: 8000
    };
  }

  public getConfig(): DbConfig {
    return { ...this.config };
  }

  public updateConfig(supabaseUrl: string, supabaseAnonKey: string): void {
    this.config = {
      supabaseUrl: supabaseUrl.replace(/\/$/, ''),
      supabaseAnonKey,
      isConfigured: Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project')),
      timeoutMs: 8000
    };
    this.connectionCache = null;
  }

  public isLiveDatabaseEnabled(): boolean {
    return this.config.isConfigured;
  }

  /**
   * Health check for remote database connection
   */
  public async checkConnection(forceRefresh = false): Promise<DbConnectionStatus> {
    const now = Date.now();
    if (!forceRefresh && this.connectionCache && (now - this.connectionCache.timestamp < this.CACHE_TTL_MS)) {
      return this.connectionCache.status;
    }

    if (!this.config.isConfigured) {
      const status: DbConnectionStatus = {
        connected: false,
        mode: 'offline',
        error: 'Database credentials not configured. Operating in high-performance local offline mode.'
      };
      this.connectionCache = { status, timestamp: now };
      return status;
    }

    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

      // Ping Supabase REST health endpoint / rest/v1/ with apikey
      const res = await fetch(`${this.config.supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          apikey: this.config.supabaseAnonKey,
          Authorization: `Bearer ${this.config.supabaseAnonKey}`
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      if (res.ok || res.status === 404 || res.status === 400) {
        // Status 200/404/400 implies reachable REST gateway
        const status: DbConnectionStatus = {
          connected: true,
          mode: 'remote',
          latencyMs,
          endpoint: this.config.supabaseUrl
        };
        this.connectionCache = { status, timestamp: now };
        return status;
      }

      throw new Error(`Database returned HTTP status ${res.status}`);
    } catch (err: any) {
      const status: DbConnectionStatus = {
        connected: false,
        mode: 'offline',
        error: err.name === 'AbortError' ? 'Database connection timed out' : (err?.message || 'Network error'),
        endpoint: this.config.supabaseUrl
      };
      this.connectionCache = { status, timestamp: now };
      return status;
    }
  }

  /**
   * Performs an authenticated REST query against Supabase / PostgREST
   */
  public async restRequest<T>(
    table: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: any;
      query?: Record<string, string>;
      headers?: Record<string, string>;
    } = {}
  ): Promise<{ data: T | null; error: Error | null; status: number }> {
    if (!this.config.isConfigured) {
      return {
        data: null,
        error: new Error('Remote database is not configured. Request skipped.'),
        status: 0
      };
    }

    const { method = 'GET', body, query, headers = {} } = options;
    const url = new URL(`${this.config.supabaseUrl}/rest/v1/${table}`);

    if (query) {
      Object.entries(query).forEach(([k, v]) => url.searchParams.append(k, v));
    }

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: {
          apikey: this.config.supabaseAnonKey,
          Authorization: `Bearer ${this.config.supabaseAnonKey}`,
          'Content-Type': 'application/json',
          Prefer: method === 'POST' ? 'return=representation' : 'return=minimal',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          data: null,
          error: new Error(`Database Error (${response.status}): ${errorText}`),
          status: response.status
        };
      }

      // If no content returned (e.g. DELETE or return=minimal)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return { data: null, error: null, status: response.status };
      }

      const data = await response.json();
      return { data: data as T, error: null, status: response.status };
    } catch (err: any) {
      return {
        data: null,
        error: err,
        status: 500
      };
    }
  }
}

export const dbClient = new DatabaseClient();
