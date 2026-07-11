import type { Questionnaire } from '@/services/questionnaires/types';

export type EditDetailsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    questionnaire: Questionnaire;
};
