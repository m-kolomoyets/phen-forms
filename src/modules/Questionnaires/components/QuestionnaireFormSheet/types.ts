import type { Questionnaire } from '@/services/questionnaires/types';

export type QuestionnaireFormSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    questionnaire?: Questionnaire;
};
