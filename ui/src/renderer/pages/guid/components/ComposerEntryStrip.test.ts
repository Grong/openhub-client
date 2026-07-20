/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'bun:test';

const readSource = (url: URL) => readFileSync(url, 'utf8');

const classBlock = (css: string, className: string) => {
  const start = css.indexOf(`.${className} {`);
  expect(start).toBeGreaterThan(-1);
  const end = css.indexOf('\n}', start);
  return css.slice(start, end);
};

describe('Guid composer entry strip polish', () => {
  test('renders nothing when no mode is active — config entries live in the [+] menu', () => {
    const source = readSource(new URL('./ComposerEntryStrip.tsx', import.meta.url));
    const actionRowSource = readSource(new URL('./GuidActionRow.tsx', import.meta.url));

    expect(source.includes('styles.entryStrip')).toBe(true);
    expect(source.includes('styles.entryButton')).toBe(true);
    // 默认状态不渲染任何入口
    expect(source.includes('if (!isPresetAgent && !clusterActive) return null')).toBe(true);
    // 召唤助手 / 使用 Skills / agent 集群开关收进 [+] 菜单
    expect(actionRowSource.includes("key='summon'")).toBe(true);
    expect(actionRowSource.includes("key='skills'")).toBe(true);
    expect(actionRowSource.includes("key='cluster'")).toBe(true);
    expect(actionRowSource.includes('styles.entryCountBadge')).toBe(true);
  });

  test('adds spacing between entry controls and the textarea', () => {
    const css = readSource(new URL('../index.module.css', import.meta.url));

    expect(css.includes('.entryStrip')).toBe(true);
    expect(css.includes('margin-bottom: 8px')).toBe(true);
    expect(css.includes('.entryCountBadge')).toBe(true);
  });

  test('does not advertise an unimplemented quick-switch shortcut', () => {
    const source = readSource(new URL('./ComposerEntryStrip.tsx', import.meta.url));
    const css = readSource(new URL('../index.module.css', import.meta.url));

    expect(source.includes('⌘K')).toBe(false);
    expect(source.includes('quickSwitch')).toBe(false);
    expect(css.includes('.entryQuickHint')).toBe(false);
  });

  test('keeps the entry row transparent instead of drawing a full-width background bar', () => {
    const css = readSource(new URL('../index.module.css', import.meta.url));
    const strip = classBlock(css, 'entryStrip');

    expect(strip.includes('background: transparent')).toBe(true);
    expect(strip.includes('background: color-mix')).toBe(false);
    expect(strip.includes('border-radius: 16px')).toBe(false);
  });

  test('active modes surface as dismissible state chips instead of permanent pills', () => {
    const source = readSource(new URL('./ComposerEntryStrip.tsx', import.meta.url));

    // 激活的 agent 集群显示为可关闭的状态 chip
    expect(source.includes('onToggleCluster?: () => void')).toBe(true);
    expect(source.includes('guid.entry.cluster')).toBe(true);
    expect(source.includes('styles.entryButtonActive')).toBe(true);
    expect(source.includes('styles.entryDismiss')).toBe(true);
    expect(source.includes(' as EveryUser')).toBe(false);
    // 召唤的助手人格 token 保留，可退出
    expect(source.includes('styles.entryPersonaButton')).toBe(true);
    expect(source.includes('guid.entry.backToFree')).toBe(true);
    // 技能弹层等重型配置 UI 不再挂在 composer 上
    expect(source.includes('Trigger')).toBe(false);
    expect(source.includes('guid.skillsPopover.title')).toBe(false);
  });
});
