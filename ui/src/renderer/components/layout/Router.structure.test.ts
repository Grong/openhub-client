import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'Router.tsx'), 'utf8');

describe('Router — new IA (spec phase 1)', () => {
  test('new IA routes exist', () => {
    expect(source).toContain("path='/welcome'");
    expect(source).toContain("path='/review'");
    expect(source).toContain("path='/roster'");
  });

  test('cut domains are no longer routable', () => {
    expect(source).not.toContain("path='/workshop'");
    expect(source).not.toContain("path='/assets'");
    expect(source).not.toContain("path='/public-companions'");
    expect(source).not.toContain("path='/plugins'");
    expect(source).not.toContain("path='/open-capabilities'");
  });

  test('one-time migration redirects registered (CLAUDE.md exception)', () => {
    expect(source).toContain("path='/requirements'");
    expect(source).toContain("<Navigate to='/review'");
  });

  test('session deep links still work (regression)', () => {
    expect(source).toContain("path='/conversation/:id'");
    expect(source).toContain("path='/terminal/:id'");
  });
});
