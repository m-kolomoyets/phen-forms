import type { Questionnaire } from '@/services/questionnaires/types';

export type DeleteQuestionnaireDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    questionnaire: Pick<Questionnaire, 'id' | 'title'>;
    // Extra work after a successful delete — e.g. the admin list invalidating its
    // own query key (the mutation only invalidates the normal questionnaires key).
    onDeleted?: () => void;
};
