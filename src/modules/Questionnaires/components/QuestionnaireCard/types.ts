import type { Questionnaire } from '@/services/questionnaires/types';

export type QuestionnaireCardProps = {
    questionnaire: Questionnaire;
    onEdit: (questionnaire: Questionnaire) => void;
    onDelete: (questionnaire: Questionnaire) => void;
};
