import type { QuestionWithOptions } from '@/services/questions/types';
import type { Answer, ResponseWithAnswers } from '@/services/responses/types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { formatDateTime } from '@/lib/utils/formatDateTime';

// Deep, pure export module. Turns questions + fetched response rows into a flat
// table, then serializes to CSV (papaparse) or XLSX (SheetJS). UI-agnostic: the
// results page wires downloads on top. One column per question (canonical
// position order) plus a leading "Submitted at" column; one row per response.

export type ExportTable = {
    headers: string[];
    rows: string[][];
};

const SUBMITTED_AT_HEADER = 'Submitted at';
const MULTI_JOIN = '; ';
const RANKING_JOIN = ' > ';

// option id -> label, across every question. Answers reference stable option ids.
const buildOptionLabels = (questions: QuestionWithOptions[]): Map<string, string> => {
    const labels = new Map<string, string>();

    for (const question of questions) {
        for (const option of question.question_options) {
            labels.set(option.id, option.label);
        }
    }

    return labels;
};

const asOptionIds = (value: Answer['value_options']): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter((id): id is string => {
        return typeof id === 'string';
    });
};

// Render one answer as its display string. Unanswered (missing) questions render
// blank. Encoding mirrors the fill-in submission shape per question type.
const formatCell = (
    question: QuestionWithOptions,
    answer: Answer | undefined,
    optionLabels: Map<string, string>
): string => {
    if (!answer) {
        return '';
    }

    switch (question.type) {
        case 'short_text':
        case 'long_text':
        case 'yes_no': {
            return answer.value_text ?? '';
        }
        case 'opinion_scale': {
            return answer.value_number === null ? '' : String(answer.value_number);
        }
        case 'single_choice': {
            const [id] = asOptionIds(answer.value_options);

            return id ? (optionLabels.get(id) ?? '') : '';
        }
        case 'multiple_choice': {
            const labels = asOptionIds(answer.value_options).map((id) => {
                return optionLabels.get(id) ?? '';
            });
            const other = answer.value_text?.trim();

            if (other) {
                labels.push(other);
            }

            return labels.join(MULTI_JOIN);
        }
        case 'ranking': {
            return asOptionIds(answer.value_options)
                .map((id) => {
                    return optionLabels.get(id) ?? '';
                })
                .join(RANKING_JOIN);
        }
    }
};

export const buildExportTable = (questions: QuestionWithOptions[], responses: ResponseWithAnswers[]): ExportTable => {
    const optionLabels = buildOptionLabels(questions);
    const headers = [
        SUBMITTED_AT_HEADER,
        ...questions.map((question) => {
            return question.prompt;
        }),
    ];

    const rows = responses.map((response) => {
        const byQuestion = new Map<string, Answer>();

        for (const answer of response.answers) {
            byQuestion.set(answer.question_id, answer);
        }

        return [
            formatDateTime(response.submitted_at),
            ...questions.map((question) => {
                return formatCell(question, byQuestion.get(question.id), optionLabels);
            }),
        ];
    });

    return { headers, rows };
};

// papaparse quotes cells containing commas, quotes, or newlines automatically.
export const toCsv = (table: ExportTable): string => {
    return Papa.unparse({ fields: table.headers, data: table.rows });
};

// SheetJS array-of-arrays -> single-sheet workbook -> xlsx bytes (Uint8Array).
export const toXlsx = (table: ExportTable): Uint8Array => {
    const worksheet = XLSX.utils.aoa_to_sheet([table.headers, ...table.rows]);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');

    return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
};
