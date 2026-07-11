import type { ShareRole } from '@/services/shares/types';

export const ROLE_OPTIONS = [
    { value: 'editor', label: 'Editor', hint: 'Edit questions & settings, view responses' },
    { value: 'viewer', label: 'Viewer', hint: 'View responses only' },
] as const satisfies ReadonlyArray<{ value: ShareRole; label: string; hint: string }>;

export const ROLE_LABEL: Record<ShareRole, string> = {
    editor: 'Editor',
    viewer: 'Viewer',
};
