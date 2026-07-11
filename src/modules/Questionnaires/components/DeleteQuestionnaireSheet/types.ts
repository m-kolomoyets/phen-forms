import type { Questionnaire } from '@/services/questionnaires/types';

export type DeleteQuestionnaireSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    questionnaire: Questionnaire;
};
