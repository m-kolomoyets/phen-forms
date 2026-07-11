import type { ObjectDotNotation } from '@/lib/types';
import type { AuthRole } from '@/services/authExample/types';
import { notFound } from '@tanstack/react-router';
import { ROLES_IDS } from '@/lib/constants';

export const ROLES_CONFIG = {
    [ROLES_IDS.admin]: {
        id: ROLES_IDS.admin,
        label: 'Admin',
    },
    [ROLES_IDS.moderator]: {
        id: ROLES_IDS.moderator,
        label: 'Moderator',
    },
    [ROLES_IDS.user]: {
        id: ROLES_IDS.user,
        label: 'User',
    },
} as const;

export type RolePermissionsKeys = ObjectDotNotation<typeof ROLES_PERMISSIONS>;
export const ROLES_PERMISSIONS = {
    merchants: {
        view: [ROLES_IDS.moderator, ROLES_IDS.admin],
        item: {
            view: [ROLES_IDS.moderator, ROLES_IDS.admin],
            update: [ROLES_IDS.admin],
        },
    },
    vouchers: {
        view: [ROLES_IDS.admin],
        update: [ROLES_IDS.admin],
        item: {
            view: [ROLES_IDS.admin],
        },
    },
} as const;

type PermissionsReduceResult = Record<string, Record<string, unknown> | string[]>;
export const hasPermissions = (permissionKey: RolePermissionsKeys, authRole?: AuthRole) => {
    const propertiesChain = permissionKey.split('.');
    const clonedRolesPermissions = structuredClone(ROLES_PERMISSIONS);
    const permissions = propertiesChain.reduce<PermissionsReduceResult>((acc, cur) => {
        return acc[cur as keyof typeof acc] as PermissionsReduceResult;
    }, clonedRolesPermissions);

    return Array.isArray(permissions) && permissions.includes(authRole);
};

export const checkIsRouteAllowed = (rolePermissionKey: RolePermissionsKeys, role?: AuthRole) => {
    const isAllowed = hasPermissions(rolePermissionKey, role);

    if (!isAllowed) {
        throw notFound();
    }
};
