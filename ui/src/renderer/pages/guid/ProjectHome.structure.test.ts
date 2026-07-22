import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pageSource = readFileSync(join(here, 'GuidPage.tsx'), 'utf8');

describe('guid → project home (spec §3)', () => {
  test('hero uses project-scoped copy', () => {
    expect(pageSource).toContain('guid.projectHome.hero');
  });
  test('composer carries project context strip', () => {
    expect(pageSource).toContain('ProjectContextStrip');
  });
  test('records last project on entry', () => {
    expect(pageSource).toContain('writeLastProjectId');
  });
  test('resolves landing target when no workspace given', () => {
    expect(pageSource).toContain('resolveLandingTarget');
  });
});
