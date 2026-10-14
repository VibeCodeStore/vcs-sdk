/**
 * @vcs/sdk: how an app built on VCS reaches company data.
 *
 * Apps never hold credentials. Every call goes to the VCS connector gateway
 * inside the company's environment, which checks the access rule before
 * touching any system.
 */

export class VcsError extends Error {
  constructor(message, code, status) { super(message); this.code = code; this.status = status; }
}

export function createClient({ gateway = '/vcs', fetchImpl = globalThis.fetch, appId, sessionToken } = {}) {
  if (!fetchImpl) throw new Error('fetch is not available');
  async function call(path, body) {
    const res = await fetchImpl(`${gateway}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-vcs-app': appId || '', ...(sessionToken ? { authorization: `Bearer ${sessionToken}` } : {}) },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new VcsError(data.message || `request failed (${res.status})`, data.code || 'VCS_ERROR', res.status);
    return data;
  }
  return {
    /** Who is using the app (from company single sign-on). */
    me: () => call('/me', {}),
    /** Typed access to one resource through an approved connector. */
    data(resource) {
      if (!/^[a-z][a-z0-9_.-]*$/.test(resource)) throw new VcsError(`invalid resource ${resource}`, 'BAD_RESOURCE');
      return {
        list: (q = {}) => call(`/data/${resource}/list`, q),
        get: id => call(`/data/${resource}/get`, { id }),
        create: value => call(`/data/${resource}/create`, { value }),
        update: (id, patch) => call(`/data/${resource}/update`, { id, patch }),
      };
    },
    /** The app's own private key-value store (its own database). */
    store: {
      get: key => call('/store/get', { key }),
      set: (key, value) => call('/store/set', { key, value }),
    },
  };
}

/** Browser helper: one shared client per page. */
let shared;
export function useVcs(opts) { return (shared ||= createClient(opts)); }
