import type { Collaborator, ShareRole } from '@/services/shares/types';
import type { CollaboratorRowProps } from './types';
import { ChevronDownIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { getNameInitials } from '@/lib/utils/getNameInitials';
import { useOptimisticMutation } from '@/hooks/useOptimisticMutation';
import { removeCollaborator, updateCollaboratorRole } from '@/services/shares/api';
import { sharesKeys } from '@/services/shares/queryKeys';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { ROLE_LABEL, ROLE_OPTIONS } from '../../constants';

function CollaboratorRow({ questionnaireId, collaborator }: CollaboratorRowProps) {
    const collaboratorsQueryKey = sharesKeys.collaboratorsQueryKey(questionnaireId);

    const { mutate: updateRole, isPending: isUpdating } = useOptimisticMutation<
        unknown,
        Error,
        { questionnaireId: string; userId: string; role: ShareRole },
        Collaborator[]
    >({
        mutationKey: sharesKeys.updateRoleMutationKey(),
        mutationFn: updateCollaboratorRole,
        queryKey: collaboratorsQueryKey,
        updater(variables) {
            return (current) => {
                return current?.map((item) => {
                    return item.userId === variables.userId ? { ...item, role: variables.role } : item;
                });
            };
        },
        invalidates: [collaboratorsQueryKey],
    });

    const { mutate: remove, isPending: isRemoving } = useOptimisticMutation<
        unknown,
        Error,
        { questionnaireId: string; userId: string },
        Collaborator[]
    >({
        mutationKey: sharesKeys.removeMutationKey(),
        mutationFn: removeCollaborator,
        queryKey: collaboratorsQueryKey,
        updater(variables) {
            return (current) => {
                return current?.filter((item) => {
                    return item.userId !== variables.userId;
                });
            };
        },
        invalidates: [collaboratorsQueryKey],
    });

    const fullName = [collaborator.firstName, collaborator.lastName].filter(Boolean).join(' ').trim();
    const displayName = fullName || collaborator.email;
    const initials = getNameInitials(fullName || collaborator.email);

    const handleRoleChange = (value: string) => {
        const role = value as ShareRole;

        if (role === collaborator.role) {
            return;
        }

        updateRole(
            { questionnaireId, userId: collaborator.userId, role },
            {
                onError(error) {
                    toast.error(error.message);
                },
            }
        );
    };

    const handleRemove = () => {
        remove(
            { questionnaireId, userId: collaborator.userId },
            {
                onSuccess() {
                    toast.success(`Removed ${displayName}`);
                },
                onError(error) {
                    toast.error(error.message);
                },
            }
        );
    };

    return (
        <div className="flex items-center gap-3 py-2">
            <Avatar size="sm">
                <AvatarImage src={collaborator.avatarUrl ?? undefined} alt={displayName} />
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{displayName}</span>
                {!!fullName && <span className="truncate text-xs text-muted-foreground">{collaborator.email}</span>}
            </div>
            <div className="ml-auto flex items-center gap-1">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={<Button variant="outline" size="sm" disabled={isUpdating || isRemoving} />}
                    >
                        {ROLE_LABEL[collaborator.role]}
                        <ChevronDownIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuRadioGroup value={collaborator.role} onValueChange={handleRoleChange}>
                            {ROLE_OPTIONS.map((option) => {
                                return (
                                    <DropdownMenuRadioItem key={option.value} value={option.value}>
                                        {option.label}
                                    </DropdownMenuRadioItem>
                                );
                            })}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${displayName}`}
                    disabled={isRemoving}
                    onClick={handleRemove}
                >
                    <Trash2Icon />
                </Button>
            </div>
        </div>
    );
}

export { CollaboratorRow };
