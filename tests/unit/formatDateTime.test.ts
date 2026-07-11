import { describe, expect, it } from 'vitest';
import { formatDateTime } from '@/lib/utils/formatDateTime';

describe('formatDateTime', () => {
    it('renders local time as dd.mm.yyyy hh:mm with zero-padding', () => {
        // No timezone suffix -> parsed as local time, so the output is stable.
        expect(formatDateTime('2026-03-05T09:07')).toBe('05.03.2026 09:07');
        expect(formatDateTime('2026-11-20T23:45')).toBe('20.11.2026 23:45');
    });

    it('returns the raw string when unparseable', () => {
        expect(formatDateTime('not-a-date')).toBe('not-a-date');
    });
});
