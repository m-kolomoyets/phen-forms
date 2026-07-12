import type { Questionnaire } from '@/services/questionnaires/types';

export type ManageAccessDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // Only id + title are used; narrowed so both the owner list item and the admin
    // list item satisfy it.
    questionnaire: Pick<Questionnaire, 'id' | 'title'>;
};
