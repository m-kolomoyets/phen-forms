import type { AdminQuestionnaireListItem, TransferOwnershipStatus } from '@/services/admin/types';
import type { User } from '@/services/users/types';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getNameInitials } from '@/lib/utils/getNameInitials';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { transferOwnershipMutationOptions } from '@/services/admin/queries';
import { usersQueryOptions } from '@/services/users/queries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Skeleton } from '@/components/ui/Skeleton';

type TransferOwnershipDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    questionnaire: AdminQuestionnaireListItem;
};

const userName = (user: User) => {
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();

    return name.length > 0 ? name : user.email;
};

const ERROR_MESSAGE: Record<Exclude<TransferOwnershipStatus, 'transferred'>, string> = {
    forbidden: 'You cannot transfer ownership.',
    not_found: 'Questionnaire no longer exists.',
    no_user: 'That user no longer exists.',
    noop: 'That user already owns this questionnaire.',
};

function TransferOwnershipDialog({ open, onOpenChange, questionnaire }: TransferOwnershipDialogProps) {
    const { mutate: transfer, isPending } = useMutation(transferOwnershipMutationOptions());

    const [query, setQuery] = useState('');
    const debouncedQuery = useDebouncedValue(query);

    const {
        data: users,
        isPending: isUsersPending,
        isError: isUsersError,
    } = useQuery({ ...usersQueryOptions(), enabled: open });

    const handleTransfer = (user: User) => {
        transfer(
            { questionnaireId: questionnaire.id, newOwnerId: user.id },
            {
                onSuccess(status) {
                    if (status === 'transferred') {
                        toast.success(`Ownership transferred to ${userName(user)}`);
                        onOpenChange(false);

                        return;
                    }

                    toast.error(ERROR_MESSAGE[status]);
                },
                onError(error) {
                    toast.error(error.message);
                },
            }
        );
    };

    function renderUsers() {
        if (isUsersPending) {
            return (
                <div className="flex flex-col gap-2 py-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            );
        }

        if (isUsersError) {
            return <p className="py-2 text-sm text-destructive">Could not load users.</p>;
        }

        const term = debouncedQuery.trim().toLowerCase();
        const candidates = users
            .filter((user) => {
                return user.id !== questionnaire.owner_id;
            })
            .filter((user) => {
                if (term.length === 0) {
                    return true;
                }

                return `${userName(user)} ${user.email}`.toLowerCase().includes(term);
            });

        if (candidates.length === 0) {
            return (
                <p className="py-2 text-sm text-muted-foreground">
                    {term.length > 0 ? 'No users match your search.' : 'No other users to transfer to.'}
                </p>
            );
        }

        return (
            <ul className="divide-y">
                {candidates.map((user) => {
                    const name = userName(user);

                    return (
                        <li key={user.id} className="flex items-center gap-3 py-2">
                            <Avatar size="sm">
                                <AvatarImage src={user.avatar_url ?? undefined} alt={name} />
                                <AvatarFallback>{getNameInitials(name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex min-w-0 flex-col">
                                <span className="truncate text-sm font-medium">{name}</span>
                                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto"
                                disabled={isPending}
                                onClick={() => {
                                    handleTransfer(user);
                                }}
                            >
                                Make owner
                            </Button>
                        </li>
                    );
                })}
            </ul>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Transfer ownership</DialogTitle>
                    <DialogDescription>
                        Reassign “{questionnaire.title}” to another user. The previous owner loses access.
                    </DialogDescription>
                </DialogHeader>
                <Input
                    type="search"
                    placeholder="Search users by name or email"
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                    }}
                    aria-label="Search users"
                />
                <ScrollArea className="max-h-72" fade={true}>
                    {renderUsers()}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

export { TransferOwnershipDialog };
