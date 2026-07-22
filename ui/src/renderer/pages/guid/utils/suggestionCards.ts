/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

export type SuggestionCardKey =
  | 'explore' | 'build' | 'review' | 'fix'
  | 'write' | 'ask' | 'task' | 'chat';

export interface SuggestionCard {
  key: SuggestionCardKey;
  labelKey: string;
}

const DEV_CARDS: SuggestionCard[] = [
  { key: 'explore', labelKey: 'guid.projectHome.suggest.explore' },
  { key: 'build', labelKey: 'guid.projectHome.suggest.build' },
  { key: 'review', labelKey: 'guid.projectHome.suggest.review' },
  { key: 'fix', labelKey: 'guid.projectHome.suggest.fix' },
];

const GENERIC_CARDS: SuggestionCard[] = [
  { key: 'write', labelKey: 'guid.projectHome.suggest.write' },
  { key: 'ask', labelKey: 'guid.projectHome.suggest.ask' },
  { key: 'task', labelKey: 'guid.projectHome.suggest.task' },
  { key: 'chat', labelKey: 'guid.projectHome.suggest.chat' },
];

/**
 * 建议卡（一期降级规则，spec §11 前置说明）：git 仓库 → 研发卡；否则 → 通用卡。
 * 二期项目实体带类型字段后改为按类型生成。
 */
export function getSuggestionCards(isGitRepo: boolean): SuggestionCard[] {
  return isGitRepo ? DEV_CARDS : GENERIC_CARDS;
}

/** git 检测：与 SessionList/hooks/useWorkpathBranches.ts 同一数据源。 */
export async function detectGitRepo(
  workpath: string,
  invoke: (args: { path: string; workspace: string }) => Promise<unknown>
): Promise<boolean> {
  const trimmed = workpath.replace(/[\\/]+$/, '');
  const separator = workpath.includes('\\') ? '\\' : '/';
  try {
    const info = (await invoke({ path: `${trimmed}${separator}.git`, workspace: workpath })) as { mode?: string } | null;
    return info?.mode === 'git-repo';
  } catch {
    return false;
  }
}
