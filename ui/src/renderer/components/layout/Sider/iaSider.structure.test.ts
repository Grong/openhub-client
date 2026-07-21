import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const siderSource = readFileSync(join(here, 'index.tsx'), 'utf8');
const navSource = readFileSync(join(here, 'SiderNav/IaNavItems.tsx'), 'utf8');

describe('Sider — new IA nav (spec §3)', () => {
  test('nav contains exactly the confirmed set', () => {
    for (const key of ['assign', 'review', 'scheduled', 'roster', 'knowledge', 'settings']) {
      expect(navSource).toContain(`'${key}'`);
    }
  });

  test('cut domains absent from nav', () => {
    expect(navSource).not.toContain('workshop');
    expect(navSource).not.toContain('plugins');
    expect(navSource).not.toContain('open-capabilities');
    expect(navSource).not.toContain('public-companions');
  });

  test('review badge uses one aggregate query (no per-project fetch)', () => {
    const hookSource = readFileSync(join(here, 'useNeedsReviewCount.ts'), 'utf8');
    expect(hookSource).toContain("status: 'needs_review'");
    expect(hookSource).toContain('page_size: 1');
  });
});
