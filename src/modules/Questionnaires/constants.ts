import type { BadgeProps } from '@/components/ui/Badge/types';
import type { QuestionnaireRole, QuestionnaireStatus } from '@/services/questionnaires/types';

export const QUESTIONNAIRE_STATUS_BADGE: Record<
    QuestionnaireStatus,
    { label: string; variant: BadgeProps['variant'] }
> = {
    draft: { label: 'Draft', variant: 'secondary' },
    published: { label: 'Published', variant: 'default' },
    closed: { label: 'Closed', variant: 'outline' },
};

// Role label shown on a collaborator's shared card (owner cards use a count badge).
export const QUESTIONNAIRE_ROLE_LABEL: Record<QuestionnaireRole, string> = {
    owner: 'Owner',
    editor: 'Editor',
    viewer: 'Viewer',
};
