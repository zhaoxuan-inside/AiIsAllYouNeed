// SearchIndex：bigram 倒排检索（module_contracts.md §1.2；FEAT-006 <100ms）
import { KnowledgePoint } from '../data/types';

export interface SearchHit {
  id: string;
  title: string;
  snippet: string;
  highlights: Array<[number, number]>;
}

export function tokenize(s: string): string[] {
  const norm = s.toLowerCase().trim();
  const toks: string[] = [];
  let lat = '';
  for (const ch of norm) {
    if (/[a-z0-9]/.test(ch)) {
      lat += ch;
      continue;
    }
    if (lat) {
      toks.push(lat);
      lat = '';
    }
    toks.push(ch);
  }
  if (lat) toks.push(lat);
  const grams: string[] = [];
  for (let i = 0; i < toks.length; i++) {
    grams.push(toks[i]);
    if (i + 1 < toks.length) grams.push(toks[i] + toks[i + 1]);
  }
  return grams;
}

export class SearchIndex {
  private index = new Map<string, string[]>();

  build(points: KnowledgePoint[]): void {
    this.index = new Map();
    for (const p of points) {
      const text = [p.title, ...p.aliases, p.summary, ...p.tags].join(' ');
      for (const g of new Set(tokenize(text))) {
        const list = this.index.get(g);
        if (list) list.push(p.id);
        else this.index.set(g, [p.id]);
      }
    }
  }

  search(q: string, points: KnowledgePoint[]): SearchHit[] {
    const grams = tokenize(q);
    if (!grams.length) return [];
    let hit = this.index.get(grams[0]) ?? [];
    for (let i = 1; i < grams.length; i++) {
      const s2 = new Set(this.index.get(grams[i]) ?? []);
      hit = hit.filter((id) => s2.has(id));
    }
    const byId = new Map(points.map((p) => [p.id, p]));
    return hit
      .map((id) => byId.get(id))
      .filter((p): p is KnowledgePoint => Boolean(p))
      .sort((a, b) => b.year - a.year) // 最新优先
      .slice(0, 20)
      .map((p) => ({
        id: p.id,
        title: p.title,
        snippet: p.summary,
        highlights: locate(p, q),
      }));
  }
}

function locate(p: KnowledgePoint, q: string): Array<[number, number]> {
  const text = `${p.title} ${p.summary}`;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  return idx >= 0 ? [[idx, idx + q.length]] : [];
}

export const searchIndex = new SearchIndex();
