import type { Questionnaire } from '@/services/questionnaires/types';

export type QuestionnaireSettingsSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    questionnaire: Questionnaire;
};
