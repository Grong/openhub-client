/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import { ipcBridge } from '@/common';
import { isHandledAuthExpiredHttpError } from '@/common/adapter/httpBridge';
import { useCallback, useEffect, useState } from 'react';

/**
 * 待验收角标：一次聚合查询（page_size=1 只取 total），订阅需求变更事件实时刷新。
 * 失败静默归零（角标不是关键路径）。
 */
export function useNeedsReviewCount(): { count: number } {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await ipcBridge.requirements.list.invoke({ status: 'needs_review', page: 1, page_size: 1 });
      setCount(res.total);
    } catch (e) {
      if (isHandledAuthExpiredHttpError(e)) return;
      setCount(0);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const unsubs = [
      ipcBridge.requirements.onCreated.on(() => void refresh()),
      ipcBridge.requirements.onStatusChanged.on(() => void refresh()),
      ipcBridge.requirements.onUpdated.on(() => void refresh()),
      ipcBridge.requirements.onDeleted.on(() => void refresh()),
    ];
    return () => unsubs.forEach((u) => u());
  }, [refresh]);

  return { count };
}
