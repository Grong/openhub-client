/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'bun:test';

const readSource = (url: URL) => readFileSync(url, 'utf8');

describe('Guid current skills entry integration', () => {
  test('passes the resolved active skill count into the [+] menu entry', () => {
    const source = readSource(new URL('../GuidPage.tsx', import.meta.url));

    expect(source.includes('const activeSkills = useMemo')).toBe(true);
    expect(source.includes('activeSkillCount={activeSkillCount}')).toBe(true);
    expect(source.includes('onAdjustSkills={handleOpenSkillsDrawer}')).toBe(true);
    expect(source.includes('onInsertSkill={handleInsertSkillCommand}')).toBe(false);
    expect(source.includes('onManageSkills={handleManageActiveSkills}')).toBe(false);
  });

  test('keeps Skills Hub management separate from the lightweight current-skills hint', () => {
    const source = readSource(new URL('../GuidPage.tsx', import.meta.url));

    expect(source.includes('handleManageActiveSkills')).toBe(false);
    expect(source.includes("next.set('activeSkills'")).toBe(false);
    expect(source.includes("activeSkills.map((skill) => skill.name).join(',')")).toBe(false);
  });
});
