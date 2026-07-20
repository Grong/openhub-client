/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

/** localStorage key: whether the user has completed or skipped onboarding. */
export const ONBOARDING_SKIPPED_KEY = 'openhub_onboarding_skipped';

/** Check whether the onboarding wizard should be shown. */
export const shouldShowOnboarding = (): boolean => {
  return localStorage.getItem(ONBOARDING_SKIPPED_KEY) !== 'true';
};
