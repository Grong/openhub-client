/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

/** localStorage key: 最近使用的项目 id（单机状态，见 spec 默认落点规则）。 */
export const LAST_PROJECT_KEY = 'openhub_last_project_id';

export type LandingTarget = { kind: 'project'; projectId: string } | { kind: 'onboarding' };

/**
 * 默认落点决策：
 * - 无项目 → 引导页（新建/打开）
 * - 有项目 → 最近使用的项目；已被删则回落到列表第一个
 */
export function resolveLandingTarget(
  lastProjectId: string | null,
  projects: ReadonlyArray<{ id: string }>
): LandingTarget {
  if (projects.length === 0) return { kind: 'onboarding' };
  if (lastProjectId && projects.some((p) => p.id === lastProjectId)) {
    return { kind: 'project', projectId: lastProjectId };
  }
  return { kind: 'project', projectId: projects[0].id };
}

export function readLastProjectId(): string | null {
  try {
    return localStorage.getItem(LAST_PROJECT_KEY);
  } catch {
    return null;
  }
}

export function writeLastProjectId(projectId: string): void {
  try {
    localStorage.setItem(LAST_PROJECT_KEY, projectId);
  } catch {
    /* best effort */
  }
}
