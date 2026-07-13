/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, test } from 'bun:test';
import {
  BACKGROUND_BLOCK_END,
  BACKGROUND_BLOCK_START,
  backgroundCssBlockNeedsUpgrade,
  injectBackgroundCssBlock,
} from './backgroundUtils';

const IMAGE_DATA_URL = 'data:image/png;base64,AAAA';

describe('manual theme background CSS', () => {
  test('keeps the image in one shared background rule and switches masks with theme variables', () => {
    const css = injectBackgroundCssBlock('', IMAGE_DATA_URL);

    expect(css.includes('/* OpenHub Theme Background Mask v2 */')).toBe(true);
    expect(css.includes('--openhub-manual-bg-mask: rgba(255, 255, 255, 0.34);')).toBe(true);
    expect(css.includes("html[data-theme='dark']")).toBe(true);
    expect(css.includes('--openhub-manual-bg-mask: rgba(0, 0, 0, 0.34);')).toBe(true);
    expect(css.includes('linear-gradient(var(--openhub-manual-bg-mask), var(--openhub-manual-bg-mask))')).toBe(true);
    expect(css.match(/url\("data:image\/png;base64,AAAA"\)/g)).toHaveLength(1);
  });

  test('marks legacy image background blocks for upgrade', () => {
    const legacyCss = `${BACKGROUND_BLOCK_START}
body {
  background-image: url("${IMAGE_DATA_URL}");
}
${BACKGROUND_BLOCK_END}`;
    const v2Css = injectBackgroundCssBlock('', IMAGE_DATA_URL);

    expect(backgroundCssBlockNeedsUpgrade(legacyCss)).toBe(true);
    expect(backgroundCssBlockNeedsUpgrade(v2Css)).toBe(false);
  });
});
