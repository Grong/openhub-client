/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */

/** localStorage key: whether the user has completed or skipped onboarding. */
export const ONBOARDING_SKIPPED_KEY = 'nomifun_onboarding_skipped';

/** Check whether the onboarding wizard should be shown. */
export const shouldShowOnboarding = (): boolean => {
  return localStorage.getItem(ONBOARDING_SKIPPED_KEY) !== 'true';
};
