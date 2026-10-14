export class VcsError extends Error { code: string; status?: number; }
export interface Resource<T = unknown> {
  list(q?: Record<string, unknown>): Promise<{ items: T[]; next?: string }>;
  get(id: string): Promise<T>;
  create(value: Partial<T>): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
}
export interface VcsClient {
  me(): Promise<{ id: string; email: string; roles: string[] }>;
  data<T = unknown>(resource: string): Resource<T>;
  store: { get(key: string): Promise<unknown>; set(key: string, value: unknown): Promise<void> };
}
export function createClient(opts?: { gateway?: string; fetchImpl?: typeof fetch; appId?: string; sessionToken?: string }): VcsClient;
export function useVcs(opts?: Parameters<typeof createClient>[0]): VcsClient;
