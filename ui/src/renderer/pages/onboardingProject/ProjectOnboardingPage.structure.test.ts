import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'ProjectOnboardingPage.tsx'), 'utf8');

describe('project onboarding page (spec: 无项目→引导页)', () => {
  test('renders create + open entries with testids', () => {
    expect(source).toContain("data-testid='project-onboarding-page'");
    expect(source).toContain("data-testid='onboarding-create-project'");
    expect(source).toContain("data-testid='onboarding-open-project'");
  });

  test('open entry mounts an existing directory as a project', () => {
    expect(source).toContain('ipcBridge.dialog.showOpen');
    expect(source).toContain('addProjectWorkpath');
    expect(source).toContain('addRecentWorkspace');
  });

  test('elevation tokens, no 1px borders', () => {
    expect(source).toContain('var(--el-elevated)');
    expect(source).not.toContain('border: 1px');
  });
});
