import type { QuestionType } from '@/lib/questions/constants';

// Shape of `get_questionnaire_stats` — a per-question aggregate array. The RPC
// returns untyped Json; these types narrow it for the results UI. `data` is a
// discriminated union keyed by the question `type`.

export type ChoiceCount = {
    option_id: string;
    label: string;
    count: number | null;
};

export type RankingAverage = {
    option_id: string;
    label: string;
    avg_rank: number | null;
};

export type OpinionScaleData = {
    average: number | null;
    distribution: Record<string, number>;
};

export type YesNoData = {
    yes: number;
    no: number;
};

export type MultipleChoiceData = {
    options: ChoiceCount[];
    other: string[];
};

type Base = {
    question_id: string;
    prompt: string;
    response_count: number;
};

export type QuestionStat =
    | (Base & { type: 'single_choice'; data: ChoiceCount[] })
    | (Base & { type: 'multiple_choice'; data: MultipleChoiceData })
    | (Base & { type: 'ranking'; data: RankingAverage[] })
    | (Base & { type: 'opinion_scale'; data: OpinionScaleData })
    | (Base & { type: 'yes_no'; data: YesNoData })
    | (Base & { type: 'short_text' | 'long_text'; data: string[] });

export type QuestionnaireStats = QuestionStat[];

// Compile guard: every QuestionType must be covered by the union above.
type _Exhaustive = QuestionType extends QuestionStat['type'] ? true : never;
export type __Assert = _Exhaustive;
