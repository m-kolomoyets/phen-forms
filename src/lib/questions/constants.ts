import type { LucideIcon } from 'lucide-react';
import type { Database } from '@/lib/database.types';
import {
    AlignLeftIcon,
    CircleDotIcon,
    GaugeIcon,
    ListChecksIcon,
    ListOrderedIcon,
    ToggleLeftIcon,
    TypeIcon,
} from 'lucide-react';

export type QuestionType = Database['public']['Enums']['question_type'];

export const QUESTION_TYPE_ICON: Record<QuestionType, LucideIcon> = {
    single_choice: CircleDotIcon,
    multiple_choice: ListChecksIcon,
    short_text: TypeIcon,
    long_text: AlignLeftIcon,
    yes_no: ToggleLeftIcon,
    ranking: ListOrderedIcon,
    opinion_scale: GaugeIcon,
};

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
    single_choice: 'Single choice',
    multiple_choice: 'Multiple choice',
    short_text: 'Short text',
    long_text: 'Long text',
    yes_no: 'Yes / No',
    ranking: 'Ranking',
    opinion_scale: 'Opinion scale',
};

export const QUESTION_TYPE_DESCRIPTION: Record<QuestionType, string> = {
    single_choice: 'Respondents pick exactly one option',
    multiple_choice: 'Respondents pick several options',
    short_text: 'Brief free-form answer',
    long_text: 'Detailed free-form answer',
    yes_no: 'A binary yes-or-no answer',
    ranking: 'Order items by preference',
    opinion_scale: 'Rate on a numeric scale',
};

// Display order for the question-type picker.
export const QUESTION_TYPES: QuestionType[] = [
    'single_choice',
    'multiple_choice',
    'short_text',
    'long_text',
    'yes_no',
    'ranking',
    'opinion_scale',
];

// Types backed by question_options (choice + ranking). Others store no options.
export const OPTION_QUESTION_TYPES: QuestionType[] = ['single_choice', 'multiple_choice', 'ranking'];

export const isOptionQuestionType = (type: QuestionType) => {
    return OPTION_QUESTION_TYPES.includes(type);
};
