import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { localDateDaysAgo } from '@ai-usage-tracker/core/timezone';
import { buildActivityHeatmap } from './activity-heatmap.ts';

/**
 * `buildActivityHeatmap` anchors its window to "today" (stats timezone), so
 * these tests build rows for the trailing 7 calendar days.
 */
function trailingDays(n: number): { date: string; tokens: number }[] {
  return Array.from({ length: n }, (_, i) => ({
    date: localDateDaysAgo(n - 1 - i),
    tokens: 0,
  }));
}

describe('buildActivityHeatmap levelBaseline', () => {
  it('keeps level thresholds stable when a baseline is supplied', () => {
    // 6 quiet days (10 tokens) + 1 loud day (1000 tokens).
    const days = trailingDays(7).map((row, i) => ({
      ...row,
      tokens: i === 6 ? 1000 : 10,
    }));

    // Without baseline: thresholds derive from the displayed values, so the
    // loud day is level 4 and quiet days are level 1.
    const plain = buildActivityHeatmap(days, 1);
    const loudPlain = plain.weeks.flat().find(
      (cell) => cell && cell.value === 1000,
    );
    const quietPlain = plain.weeks.flat().find(
      (cell) => cell && cell.value === 10,
    );
    assert.equal(loudPlain?.level, 4);
    assert.equal(quietPlain?.level, 1);

    // With a baseline of all-1000-token days, the 1000-token day is now the
    // median of the baseline, not the top of the scale: displayed values are
    // unchanged but the level drops (scale reflects the baseline, not the
    // displayed subset).
    const loudBaseline = trailingDays(10).map((row) => ({
      ...row,
      tokens: 1000,
    }));
    const withBaseline = buildActivityHeatmap(days, 1, {
      levelBaseline: loudBaseline,
    });
    const loudRebased = withBaseline.weeks.flat().find(
      (cell) => cell && cell.value === 1000,
    );
    assert.ok(
      (loudRebased?.level ?? 0) < 4,
      'level should drop below 4 when the baseline raises the scale',
    );
  });
});