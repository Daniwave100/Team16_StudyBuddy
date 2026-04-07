// ─── Store ─── Simple reactive state management ───

const _state = {};
const _subs = {};

function _persist(key, val) {
  try { sessionStorage.setItem('sb_' + key, JSON.stringify(val)); } catch {}
}

function _hydrate(key) {
  try {
    const v = sessionStorage.getItem('sb_' + key);
    return v ? JSON.parse(v) : undefined;
  } catch { return undefined; }
}

// Hydrate persisted keys on load
['classes', 'currentClass'].forEach(k => {
  const v = _hydrate(k);
  if (v !== undefined) _state[k] = v;
});

export const store = {
  get(key) {
    return _state[key];
  },

  set(key, value) {
    _state[key] = value;
    if (['classes', 'currentClass'].includes(key)) _persist(key, value);
    (_subs[key] || []).forEach(fn => fn(value));
  },

  subscribe(key, fn) {
    if (!_subs[key]) _subs[key] = [];
    _subs[key].push(fn);
    return () => {
      _subs[key] = _subs[key].filter(f => f !== fn);
    };
  },

  update(key, updater) {
    this.set(key, updater(this.get(key)));
  }
};
