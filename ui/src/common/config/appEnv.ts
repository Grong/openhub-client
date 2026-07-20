/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import { getPlatformServices } from '@/common/platform';

/**
 * Returns baseName unchanged in release builds, or baseName + '-dev' in dev builds.
 * When OPENHUB_MULTI_INSTANCE=1, appends '-2' to isolate the second dev instance.
 * Used to isolate symlink and directory names between environments.
 *
 * @example
 * getEnvAwareName('openhub)        // release → 'openhub,        dev → '.openhub-dev'
 * getEnvAwareName('.openhub-config') // release → '.openhub-config', dev → '.openhub-config-dev'
 * // with OPENHUB_MULTI_INSTANCE=1:  dev → '.openhub-dev-2'
 */
export function getEnvAwareName(baseName: string): string {
  if (getPlatformServices().paths.isPackaged() === true) return baseName;
  const suffix = process.env.OPENHUB_MULTI_INSTANCE === '1' ? '-dev-2' : '-dev';
  return `${baseName}${suffix}`;
}
