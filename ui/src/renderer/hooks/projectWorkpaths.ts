/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import {
  getProjectWorkpaths,
  subscribeProjectWorkpaths,
} from '@renderer/pages/conversation/SessionList/utils/projectWorkpaths';

/**
 * Hook that returns the current list of project workpaths and stays
 * synchronised across tabs / windows via localStorage events.
 */
export function useProjectWorkPaths(): string[] {
  const [paths, setPaths] = useState<string[]>(() => getProjectWorkpaths());

  useEffect(() => {
    return subscribeProjectWorkpaths(() => {
      setPaths(getProjectWorkpaths());
    });
  }, []);

  return paths;
}
