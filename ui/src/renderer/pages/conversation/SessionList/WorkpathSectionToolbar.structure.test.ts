/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const readLocalSource = (fileName: string) =>
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), fileName), 'utf8');

describe('workpath section toolbar structure', () => {
  test('keeps the three create actions in one toolbar above search, batch select in display settings', () => {
    const createBarSource = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../components/ConversationShell/SessionCreateBar.tsx'),
      'utf8'
    );
    const popoverSource = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../components/ConversationShell/SessionDisplaySettingsPopover.tsx'),
      'utf8'
    );
    const actionGridIndex = createBarSource.indexOf("data-testid='session-action-grid'");
    const newChatIndex = createBarSource.indexOf("data-testid='session-new-conversation-entry'");
    const newTerminalIndex = createBarSource.indexOf("data-testid='session-new-terminal-entry'");
    const createProjectIndex = createBarSource.indexOf("data-testid='workpath-create-project-btn'");
    const searchIndex = createBarSource.indexOf('<ConversationSearchPopover');

    expect(actionGridIndex).toBeGreaterThan(-1);
    expect(newChatIndex).toBeGreaterThan(actionGridIndex);
    expect(newTerminalIndex).toBeGreaterThan(actionGridIndex);
    expect(createProjectIndex).toBeGreaterThan(actionGridIndex);
    expect(searchIndex).toBeGreaterThan(createProjectIndex);
    // 批量选择是低频管理操作，收进显示设置面板，不占主按钮位
    expect(createBarSource.includes("data-testid='workpath-batch-select-btn'")).toBe(false);
    expect(popoverSource.includes('onToggleBatchMode')).toBe(true);
  });

  test('keeps the workpath area as a section label without duplicated action buttons', () => {
    const source = readLocalSource('index.tsx');

    expect(source.includes("data-testid='workpath-section-toolbar'")).toBe(true);
    expect(source.includes("t('sessionList.workpathSection')")).toBe(true);
    expect(source.includes("data-testid='workpath-create-project-btn'")).toBe(false);
    expect(source.includes("data-testid='workpath-batch-select-btn'")).toBe(false);
  });

  test('routes project creation through the session shell instead of a hidden header icon', () => {
    const shellSource = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../components/ConversationShell/index.tsx'),
      'utf8'
    );
    const createBarSource = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../components/ConversationShell/SessionCreateBar.tsx'),
      'utf8'
    );

    expect(shellSource.includes('onCreateProject={handleCreateProject}')).toBe(true);
    expect(shellSource.includes("navigate('/guid', { state: { workspace: projectPath } })")).toBe(true);
    expect(createBarSource.includes('onCreateProject')).toBe(true);
    expect(createBarSource.includes('onToggleBatchMode')).toBe(true);
    expect(createBarSource.includes('ConversationSiderActions')).toBe(false);
  });
});
