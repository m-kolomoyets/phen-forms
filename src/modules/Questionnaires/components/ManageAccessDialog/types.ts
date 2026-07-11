import type { QuestionnaireListItem } from '@/services/questionnaires/types';

export type ManageAccessDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    questionnaire: QuestionnaireListItem;
};
