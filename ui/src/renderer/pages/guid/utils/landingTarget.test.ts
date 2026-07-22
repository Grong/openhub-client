import { describe, expect, test } from 'bun:test';
import { resolveLandingTarget } from './landingTarget';

const projects = [{ id: 'alpha' }, { id: 'beta' }];

describe('resolveLandingTarget (spec: 有项目→最近项目，无项目→引导页)', () => {
  test('no projects → onboarding', () => {
    expect(resolveLandingTarget(null, [])).toEqual({ kind: 'onboarding' });
  });

  test('has last project and it still exists → that project', () => {
    expect(resolveLandingTarget('beta', projects)).toEqual({ kind: 'project', projectId: 'beta' });
  });

  test('last project was deleted → fall back to first project', () => {
    expect(resolveLandingTarget('ghost', projects)).toEqual({ kind: 'project', projectId: 'alpha' });
  });

  test('no last project but projects exist → first project', () => {
    expect(resolveLandingTarget(null, projects)).toEqual({ kind: 'project', projectId: 'alpha' });
  });
});
