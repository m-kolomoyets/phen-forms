import type { QuestionnaireListItem } from '@/services/questionnaires/types';

export type QuestionnaireCardProps = {
    questionnaire: QuestionnaireListItem;
    onRename: (questionnaire: QuestionnaireListItem) => void;
    onDelete: (questionnaire: QuestionnaireListItem) => void;
    onToggleStatus: (questionnaire: QuestionnaireListItem) => void;
    onPreview?: (questionnaire: QuestionnaireListItem) => void;
    onManageAccess?: (questionnaire: QuestionnaireListItem) => void;
};
