/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'bun:test';

const readSource = (url: URL) => readFileSync(url, 'utf8');

describe('settings navigation', () => {
  test('exposes reorganized settings tabs with model, companion, requirements, and system', () => {
    const siderSource = readSource(new URL('./SettingsSider.tsx', import.meta.url));
    const pageWrapperSource = readSource(new URL('./SettingsPageWrapper.tsx', import.meta.url));

    for (const id of ['model', 'companion', 'requirements', 'system']) {
      expect(siderSource.includes(`'${id}'`)).toBe(true);
      expect(pageWrapperSource.includes(`id: '${id}'`)).toBe(true);
    }

    // Domains cut from the product must not remain as dead settings tabs.
    for (const removed of ['public-service', 'workshop']) {
      expect(siderSource.includes(`'${removed}'`)).toBe(false);
      expect(pageWrapperSource.includes(`id: '${removed}'`)).toBe(false);
    }

    expect(siderSource.indexOf("'model'")).toBeLessThan(siderSource.indexOf("'companion'"));
    expect(siderSource.indexOf("'companion'")).toBeLessThan(siderSource.indexOf("'requirements'"));
    expect(siderSource.indexOf("'requirements'")).toBeLessThan(siderSource.indexOf("'system'"));
  });

  test('preserves legacy settings routes for direct access', () => {
    const routerSource = readSource(new URL('../../../components/layout/Router.tsx', import.meta.url));

    for (const path of ['/settings/agent-runtime', '/settings/browser-use', '/settings/computer-use']) {
      expect(routerSource.includes(`path='${path}'`)).toBe(true);
    }

    expect(routerSource.includes("path='/settings/browser-use' element={<Navigate to='/settings/system'")).toBe(false);
    expect(routerSource.includes("path='/settings/computer-use' element={<Navigate to='/settings/system'")).toBe(false);
  });
});
