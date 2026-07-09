/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'bun:test';

const readSource = (url: URL) => readFileSync(url, 'utf8');

describe('settings navigation', () => {
  test('exposes reorganized settings tabs with model, companion, requirements, public-service, workshop, and system', () => {
    const siderSource = readSource(new URL('./SettingsSider.tsx', import.meta.url));
    const pageWrapperSource = readSource(new URL('./SettingsPageWrapper.tsx', import.meta.url));

    for (const id of ['model', 'companion', 'requirements', 'public-service', 'workshop', 'system']) {
      expect(siderSource.includes(`'${id}'`)).toBe(true);
      expect(pageWrapperSource.includes(`id: '${id}'`)).toBe(true);
    }

    expect(siderSource.indexOf("'model'")).toBeLessThan(siderSource.indexOf("'companion'"));
    expect(siderSource.indexOf("'companion'")).toBeLessThan(siderSource.indexOf("'requirements'"));
    expect(siderSource.indexOf("'requirements'")).toBeLessThan(siderSource.indexOf("'public-service'"));
    expect(siderSource.indexOf("'public-service'")).toBeLessThan(siderSource.indexOf("'workshop'"));
    expect(siderSource.indexOf("'workshop'")).toBeLessThan(siderSource.indexOf("'system'"));
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
