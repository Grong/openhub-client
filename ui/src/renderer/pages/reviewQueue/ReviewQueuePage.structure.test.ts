import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'ReviewQueuePage.tsx'), 'utf8');
const hookSource = readFileSync(join(here, 'useReviewQueue.ts'), 'utf8');

describe('review queue page (spec 11.3)', () => {
  test('data source is needs_review requirements', () => {
    expect(hookSource).toContain("status: 'needs_review'");
  });

  test('rows expose approve/reject actions', () => {
    expect(source).toContain("data-testid='review-queue-approve'");
    expect(source).toContain("data-testid='review-queue-reject'");
  });

  test('batch approve exists and empty state invites assignment', () => {
    expect(source).toContain("data-testid='review-queue-batch-approve'");
    expect(source).toContain('reviewQueue.emptyAction');
  });

  test('error state reuses LoadErrorResult', () => {
    expect(source).toContain('LoadErrorResult');
  });
});
