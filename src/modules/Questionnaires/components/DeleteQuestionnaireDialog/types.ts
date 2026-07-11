import type { Questionnaire } from '@/services/questionnaires/types';

export type DeleteQuestionnaireDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    questionnaire: Questionnaire;
};
