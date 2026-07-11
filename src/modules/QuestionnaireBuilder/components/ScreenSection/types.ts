import type { Questionnaire } from '@/services/questionnaires/types';

export type ScreenKind = 'welcome' | 'ending';

export type ScreenSectionProps = {
    kind: ScreenKind;
    questionnaire: Questionnaire;
};
