import type { QuestionWithOptions } from '@/services/questions/types';

export type RankingFieldProps = {
    question: QuestionWithOptions;
    orderedIds: string[];
    onChange: (orderedIds: string[]) => void;
};

export type RankingItemProps = {
    id: string;
    label: string;
    rank: number;
};
