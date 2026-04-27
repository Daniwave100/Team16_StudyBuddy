// ─── Auth Module ─── Supabase authentication wrapper ───

const SUPABASE_URL = 'https://dxmvxdpqlxymrmsutwwh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Ln49ryeUgDU337oysI9egg_8PY4fpwF';

let _client = null;
const _listeners = [];

async function _getClient() {
  if (_client) return _client;
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  _client.auth.onAuthStateChange((_event, session) => {
    const user = session?.user ?? null;
    _listeners.forEach(fn => fn(user));
  });
  return _client;
}

export const auth = {
  async login(email, password) {
    try {
      const sb = await _getClient();
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      localStorage.setItem('sb_user', JSON.stringify(data.session.user));
      return { ok: true, user: data.session.user };
    } catch (err) {
      return { ok: false, error: 'Could not connect to auth service. Check your internet connection.' };
    }
  },

  async signup(email, password) {
    try {
      const sb = await _getClient();
      const { error } = await sb.auth.signUp({ email, password });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (err) {
      return { ok: false, error: 'Could not connect to auth service. Check your internet connection.' };
    }
  },

  async logout() {
    try {
      const sb = await _getClient();
      await sb.auth.signOut();
    } catch { /* ignore */ }
    localStorage.removeItem('sb_user');
  },

  async getUser() {
    try {
      const sb = await _getClient();
      const { data } = await sb.auth.getSession();
      if (data?.session?.user) {
        localStorage.setItem('sb_user', JSON.stringify(data.session.user));
        return data.session.user;
      }
    } catch { /* offline or error */ }
    const cached = localStorage.getItem('sb_user');
    return cached ? JSON.parse(cached) : null;
  },

  isLoggedIn() {
    return !!localStorage.getItem('sb_user');
  },

  getCachedUser() {
    const cached = localStorage.getItem('sb_user');
    return cached ? JSON.parse(cached) : null;
  },

  onAuthChange(fn) {
    _listeners.push(fn);
    return () => {
      const i = _listeners.indexOf(fn);
      if (i >= 0) _listeners.splice(i, 1);
    };
  }
};
