import type { BadgeProps } from '@/components/ui/Badge/types';
import type { QuestionnaireStatus } from '@/services/questionnaires/types';

export const QUESTIONNAIRE_STATUS_BADGE: Record<
    QuestionnaireStatus,
    { label: string; variant: BadgeProps['variant'] }
> = {
    draft: { label: 'Draft', variant: 'secondary' },
    published: { label: 'Published', variant: 'default' },
    closed: { label: 'Closed', variant: 'outline' },
};
