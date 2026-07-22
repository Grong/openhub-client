import { describe, expect, test } from 'bun:test';
import { getSuggestionCards } from './suggestionCards';

describe('getSuggestionCards (spec 11: 建议卡按 git 检测降级)', () => {
  test('git repo → dev cards', () => {
    const keys = getSuggestionCards(true).map((c) => c.key);
    expect(keys).toEqual(['explore', 'build', 'review', 'fix']);
  });

  test('non-git → generic cards', () => {
    const keys = getSuggestionCards(false).map((c) => c.key);
    expect(keys).toEqual(['write', 'ask', 'task', 'chat']);
  });
});
