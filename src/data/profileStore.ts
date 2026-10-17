// ProfileStore：本地档案唯一写方（module_contracts.md §1.3；数据不出本机）
import { defaultProfile, type Profile } from './types';

const KEY = 'atlas.profile';
let profile: Profile = load();
const subs = new Set<(p: Profile) => void>();

function load(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return defaultProfile;
}

function persist(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // 存储配额满 → 内存态继续（module_contracts §3）
  }
}

export const profileStore = {
  get(): Profile {
    return profile;
  },
  update(patch: Partial<Profile>): void {
    profile = { ...profile, ...patch };
    persist();
    subs.forEach((cb) => cb(profile));
  },
  toggleFavorite(id: string): void {
    const has = profile.favorites.includes(id);
    this.update({
      favorites: has ? profile.favorites.filter((f) => f !== id) : [...profile.favorites, id],
    });
  },
  toggleRead(id: string): void {
    const next = { ...profile.readStates };
    if (id in next) delete next[id];
    else next[id] = Date.now();
    this.update({ readStates: next });
  },
  setNote(id: string, text: string): void {
    const notes = { ...profile.notes };
    if (text.trim()) notes[id] = text;
    else delete notes[id];
    this.update({ notes });
  },
  subscribe(cb: (p: Profile) => void): () => void {
    subs.add(cb);
    return () => subs.delete(cb);
  },
};
