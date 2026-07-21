import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'RosterPage.tsx'), 'utf8');

describe('roster page (spec: 员工名册)', () => {
  test('aggregates agents and assistants, read-only in phase 1', () => {
    // 计划写作 ipcBridge.agents.list，实际 bridge 无该命名空间；
    // GET /api/agents 的真实方法是 acpConversation.getAvailableAgents。
    expect(source).toContain('ipcBridge.acpConversation.getAvailableAgents');
    expect(source).toContain('ipcBridge.assistants.list');
  });

  test('has warm empty state with primary action', () => {
    expect(source).toContain("data-testid='roster-empty'");
    expect(source).toContain('roster.emptyAction');
  });

  test('error state reuses LoadErrorResult', () => {
    expect(source).toContain('LoadErrorResult');
  });
});
