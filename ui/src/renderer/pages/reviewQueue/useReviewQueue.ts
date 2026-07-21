/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import { ipcBridge } from '@/common';
import type { IRequirement } from '@/common/adapter/ipcBridge';
import { useRequirements } from '@renderer/pages/requirements/useRequirements';
import { useCallback, useMemo } from 'react';

export interface ReviewGroup {
  project: string;
  items: IRequirement[];
}

/** 待验收队列：按项目（workpath）分组的 NeedsReview 需求。 */
export function useReviewQueue() {
  const { items, total, loading, error, refresh } = useRequirements({ status: 'needs_review', page: 1, page_size: 100 });

  const groups = useMemo<ReviewGroup[]>(() => {
    const map = new Map<string, IRequirement[]>();
    for (const item of items) {
      const key = (item as { workpath?: string }).workpath || item.tag || '';
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return [...map.entries()].map(([project, groupItems]) => ({ project, items: groupItems }));
  }, [items]);

  const approve = useCallback(
    async (id: number) => {
      await ipcBridge.requirements.update.invoke({ id, updates: { status: 'done' } });
      void refresh();
    },
    [refresh]
  );

  const reject = useCallback(
    async (id: number) => {
      await ipcBridge.requirements.update.invoke({ id, updates: { status: 'in_progress' } });
      void refresh();
    },
    [refresh]
  );

  const approveAll = useCallback(async () => {
    await Promise.all(items.map((item) => ipcBridge.requirements.update.invoke({ id: item.id, updates: { status: 'done' } })));
    void refresh();
  }, [items, refresh]);

  return { groups, total, loading, error, refresh, approve, reject, approveAll };
}
