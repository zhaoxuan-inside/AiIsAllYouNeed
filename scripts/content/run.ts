// 内容管线编排（FEAT-010）：标题清单 → KnowledgeSource → zod 校验（fail-fast）→ 产出 JSON
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TITLES, DOMAINS, ROADMAP } from './catalog';
import { fixtureSource } from './source';
import { knowledgePointSchema, type KnowledgePoint } from '../../src/data/types';

const OUT = resolve('public/data');

function validate(points: KnowledgePoint[], domains: string[]): void {
  const ids = new Set(points.map((p) => p.id));
  const domainKeys = new Set(domains);
  const errors: string[] = [];
  for (const p of points) {
    // 字段级
    const r = knowledgePointSchema.safeParse({ ...p, backlinks: [] });
    if (!r.success) {
      errors.push(`${p.id}: ${r.error.issues.map((i) => `${i.path.join('.')}=${i.message}`).join('; ')}`);
      continue;
    }
    // 引用完整性（data_schema.md D4：fail-fast）
    if (!domainKeys.has(p.domain)) errors.push(`${p.id}: domain ${p.domain} 不存在`);
    for (const ref of [...p.deps, ...p.related]) {
      if (!ids.has(ref)) errors.push(`${p.id}: 引用 ${ref} 不存在`);
    }
  }
  if (errors.length) {
    console.error('[content] 校验失败（阻断构建）：');
    for (const e of errors) console.error('  - ' + e);
    process.exit(1);
  }
  // 派生 backlinks（data_schema.md：不手填，由全量引用反解）
  const map = new Map<string, string[]>();
  for (const p of points) {
    for (const ref of [...p.deps, ...p.related]) {
      map.set(ref, [...new Set([...(map.get(ref) ?? []), p.id])]);
    }
  }
  for (const p of points) p.backlinks = (map.get(p.id) ?? []).sort();
}

async function main() {
  const validateOnly = process.argv.includes('--validate-only');
  const source = fixtureSource; // 可插拔：正式内容换 KnowledgeSource 实现即可
  const generated = await source.generate(TITLES);

  // 缺省值补齐
  const points: KnowledgePoint[] = generated.map((g) =>
    knowledgePointSchema.parse({
      id: g.id,
      title: g.title,
      aliases: g.aliases ?? [],
      domain: g.domain,
      year: g.year,
      importance: g.importance,
      difficulty: g.difficulty,
      learnTime: g.learnTime,
      tags: g.tags ?? [],
      media: g.media ?? [],
      summary: g.summary,
      body: g.body,
      papers: g.papers ?? [],
      deps: g.deps ?? [],
      related: g.related ?? [],
      backlinks: [],
    }),
  );

  validate(points, DOMAINS.map((d) => d.key));

  if (validateOnly) {
    console.log(`[content] 校验通过：${points.length} 个知识点（source=${source.id}）`);
    return;
  }

  mkdirSync(OUT, { recursive: true });
  writeFileSync(resolve(OUT, 'points.json'), JSON.stringify(points, null, 2));
  writeFileSync(resolve(OUT, 'domains.json'), JSON.stringify(DOMAINS, null, 2));
  writeFileSync(resolve(OUT, 'roadmap.json'), JSON.stringify(ROADMAP, null, 2));
  console.log(`[content] 产出 ${points.length} 个知识点 → public/data/（source=${source.id}）`);
}

main().catch((e) => {
  console.error('[content] 失败', e);
  process.exit(1);
});
