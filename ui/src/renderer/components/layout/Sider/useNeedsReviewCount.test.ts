import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'useNeedsReviewCount.ts'), 'utf8');

describe('useNeedsReviewCount', () => {
  test('subscribes to requirement change events for live badge', () => {
    expect(source).toContain('onStatusChanged');
    expect(source).toContain('onUpdated');
    expect(source).toContain('onCreated');
    expect(source).toContain('onDeleted');
  });

  test('fails soft to zero', () => {
    expect(source).toContain('catch');
    expect(source).toContain('setCount(0)');
  });
});
