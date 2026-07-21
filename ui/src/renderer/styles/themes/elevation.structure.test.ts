import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const scheme = readFileSync(join(here, 'default-color-scheme.css'), 'utf8');
const base = readFileSync(join(here, 'base.css'), 'utf8');

describe('elevation tokens (spec 11.1)', () => {
  test('light mode defines all four elevation levels', () => {
    expect(scheme).toContain('--el-canvas: #ffffff');
    expect(scheme).toContain('--el-surface: #f5f5f6');
    expect(scheme).toContain('--el-elevated: #ececee');
    expect(scheme).toContain('--el-popover: rgba(255, 255, 255, 0.85)');
  });

  test('dark mode defines all four elevation levels', () => {
    expect(scheme).toContain('--el-canvas: #141414');
    expect(scheme).toContain('--el-surface: #1c1c1e');
    expect(scheme).toContain('--el-elevated: #262628');
    expect(scheme).toContain('--el-popover: rgba(46, 46, 48, 0.85)');
  });

  test('brand-violet focus ring exists globally (spec 11.2)', () => {
    expect(base).toContain(':focus-visible');
    expect(base).toContain('outline: 2px solid rgb(var(--primary-6))');
    expect(base).toContain('outline-offset: 2px');
  });
});
