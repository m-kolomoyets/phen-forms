import type { QuestionType } from '@/lib/questions/constants';
import type { QuestionOption, QuestionWithOptions } from '@/services/questions/types';
import type { Answer, ResponseWithAnswers } from '@/services/responses/types';
import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { buildExportTable, toCsv, toXlsx } from '@/modules/Results/utils/export';

// Fixture builders. Only the fields the export module reads matter; the rest are
// filled with stable defaults so the tests assert behavior, not row shape.
const option = (id: string, label: string): QuestionOption => {
    return { id, label, position: 0, question_id: 'q' };
};

const question = (
    id: string,
    type: QuestionType,
    prompt: string,
    options: QuestionOption[] = []
): QuestionWithOptions => {
    return {
        id,
        type,
        prompt,
        description: null,
        required: false,
        position: 0,
        config: {},
        questionnaire_id: 'qn',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        question_options: options,
    };
};

const answer = (questionId: string, values: Partial<Answer>): Answer => {
    return {
        id: `a-${questionId}`,
        response_id: 'r',
        question_id: questionId,
        value_text: null,
        value_number: null,
        value_options: null,
        ...values,
    };
};

const response = (id: string, submittedAt: string, answers: Answer[]): ResponseWithAnswers => {
    return { id, submitted_at: submittedAt, answers };
};

describe('buildExportTable', () => {
    it('produces a Submitted-at column plus one column per question in order', () => {
        const questions = [question('q1', 'short_text', 'Name'), question('q2', 'opinion_scale', 'Rating')];

        const table = buildExportTable(questions, []);

        expect(table.headers).toEqual(['Submitted at', 'Name', 'Rating']);
        expect(table.rows).toEqual([]);
    });

    it('renders each question type into its display value', () => {
        const questions = [
            question('q1', 'short_text', 'Name'),
            question('q2', 'single_choice', 'Color', [option('o1', 'Red'), option('o2', 'Blue')]),
            question('q3', 'yes_no', 'Agree'),
            question('q4', 'opinion_scale', 'Score'),
            question('q5', 'ranking', 'Rank', [option('r1', 'A'), option('r2', 'B'), option('r3', 'C')]),
        ];

        const rows = [
            response('resp', '2026-02-01T10:00', [
                answer('q1', { value_text: 'Alice' }),
                answer('q2', { value_options: ['o2'] }),
                answer('q3', { value_text: 'yes' }),
                answer('q4', { value_number: 7 }),
                answer('q5', { value_options: ['r2', 'r1', 'r3'] }),
            ]),
        ];

        const table = buildExportTable(questions, rows);

        expect(table.rows).toEqual([['01.02.2026 10:00', 'Alice', 'Blue', 'yes', '7', 'B > A > C']]);
    });

    it('leaves unanswered optional questions blank', () => {
        const questions = [question('q1', 'short_text', 'Name'), question('q2', 'short_text', 'Nickname')];
        const rows = [response('resp', '2026-02-01T10:00', [answer('q1', { value_text: 'Bob' })])];

        const table = buildExportTable(questions, rows);

        expect(table.rows).toEqual([['01.02.2026 10:00', 'Bob', '']]);
    });

    it('joins multi-select labels and appends the "other" free-text', () => {
        const questions = [
            question('q1', 'multiple_choice', 'Toppings', [option('o1', 'Cheese'), option('o2', 'Ham')]),
        ];
        const rows = [
            response('resp', '2026-02-01T10:00', [
                answer('q1', { value_options: ['o1', 'o2'], value_text: 'Pineapple' }),
            ]),
        ];

        const table = buildExportTable(questions, rows);

        expect(table.rows[0][1]).toBe('Cheese; Ham; Pineapple');
    });

    it('emits one row per response, oldest-first as fetched', () => {
        const questions = [question('q1', 'short_text', 'Name')];
        const rows = [
            response('r1', '2026-02-01T10:00', [answer('q1', { value_text: 'First' })]),
            response('r2', '2026-02-02T10:00', [answer('q1', { value_text: 'Second' })]),
        ];

        const table = buildExportTable(questions, rows);

        expect(
            table.rows.map((row) => {
                return row[1];
            })
        ).toEqual(['First', 'Second']);
    });
});

describe('toCsv', () => {
    it('escapes commas, quotes and newlines', () => {
        const questions = [question('q1', 'long_text', 'Comment')];
        const rows = [response('resp', '2026-02-01T10:00', [answer('q1', { value_text: 'a,b "quoted"\nline2' })])];

        const csv = toCsv(buildExportTable(questions, rows));
        const lines = csv.split('\r\n');

        expect(lines[0]).toBe('Submitted at,Comment');
        // Comma + quote + newline force quoting; inner quotes are doubled.
        expect(csv).toContain('"a,b ""quoted""\nline2"');
    });
});

describe('toXlsx', () => {
    it('writes a workbook whose sheet round-trips the table', () => {
        const questions = [question('q1', 'short_text', 'Name')];
        const rows = [response('resp', '2026-02-01T10:00', [answer('q1', { value_text: 'Zoe' })])];

        const bytes = toXlsx(buildExportTable(questions, rows));
        const workbook = XLSX.read(bytes, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

        expect(workbook.SheetNames[0]).toBe('Responses');
        expect(parsed[0]).toEqual(['Submitted at', 'Name']);
        expect(parsed[1]).toEqual(['01.02.2026 10:00', 'Zoe']);
    });
});
