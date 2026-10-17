// KnowledgeRepo：知识数据加载 + 类型化访问（module_contracts.md §1.1）
import { KnowledgePoint, Domain, Roadmap, KnowledgeBundle } from './types';

export class KnowledgeRepo {
  private points: KnowledgePoint[] = [];
  private byId = new Map<string, KnowledgePoint>();
  private domains: Domain[] = [];
  private roadmap: Roadmap[] = [];
  private backlinkIndex = new Map<string, string[]>();

  load(bundle: KnowledgeBundle): void {
    this.points = bundle.points;
    this.domains = bundle.domains;
    this.roadmap = bundle.roadmap;
    this.byId = new Map(bundle.points.map((p) => [p.id, p]));
    // 由全量引用反解 backlinks（data_schema.md：管线推导，不手填）
    const map = new Map<string, string[]>();
    for (const p of bundle.points) {
      for (const dep of p.deps) map.set(dep, [...(map.get(dep) ?? []), p.id]);
      for (const rel of p.related) map.set(rel, [...(map.get(rel) ?? []), p.id]);
    }
    this.backlinkIndex = map;
    for (const p of bundle.points) {
      p.backlinks = [...new Set(map.get(p.id) ?? [])].sort();
    }
  }

  getPoint(id: string): KnowledgePoint | null {
    return this.byId.get(id) ?? null;
  }

  getDomains(): Domain[] {
    return [...this.domains].sort((a, b) => a.order - b.order);
  }

  getPointsByDomain(key: string): KnowledgePoint[] {
    return this.points.filter((p) => p.domain === key);
  }

  getTimeline(): KnowledgePoint[] {
    return [...this.points].sort((a, b) => a.year - b.year);
  }

  getRoadmap(domainKey: string): Roadmap | null {
    return this.roadmap.find((r) => r.domainKey === domainKey) ?? null;
  }

  getRelated(id: string): KnowledgePoint[] {
    const p = this.byId.get(id);
    if (!p) return [];
    const ids = [...new Set([...p.related, ...(this.backlinkIndex.get(id) ?? [])])];
    return ids.map((i) => this.byId.get(i)).filter((x): x is KnowledgePoint => Boolean(x));
  }

  getBacklinks(id: string): KnowledgePoint[] {
    return (this.backlinkIndex.get(id) ?? [])
      .map((i) => this.byId.get(i))
      .filter((x): x is KnowledgePoint => Boolean(x));
  }

  searchSuggestion(): string[] {
    const s = this.points.filter((p) => p.importance >= 4).map((p) => p.title);
    return s.slice(0, 5);
  }
}

export const repo = new KnowledgeRepo();
