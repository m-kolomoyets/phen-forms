import type { AdminQuestionnaireListItem } from '@/services/admin/types';
import { useState } from 'react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
    ArrowLeftRightIcon,
    ChartColumnIcon,
    EllipsisVerticalIcon,
    ListChecksIcon,
    MessageSquareTextIcon,
    Trash2Icon,
    UsersIcon,
} from 'lucide-react';
import { getNameInitials } from '@/lib/utils/getNameInitials';
import { adminQuestionnairesQueryOptions } from '@/services/admin/queries';
import { adminKeys } from '@/services/admin/queryKeys';
import { TransferOwnershipDialog } from '@/modules/Admin/TransferOwnershipDialog';
import { DeleteQuestionnaireDialog } from '@/modules/Questionnaires/components/DeleteQuestionnaireDialog';
import { ManageAccessDialog } from '@/modules/Questionnaires/components/ManageAccessDialog';
import { QUESTIONNAIRE_STATUS_BADGE } from '@/modules/Questionnaires/constants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/Empty';

const ownerName = (owner: AdminQuestionnaireListItem['owner']) => {
    if (!owner) {
        return 'Unknown owner';
    }

    const name = [owner.first_name, owner.last_name].filter(Boolean).join(' ').trim();

    return name.length > 0 ? name : owner.email;
};

function AdminQuestionnaires() {
    const { data: questionnaires } = useSuspenseQuery(adminQuestionnairesQueryOptions());
    const queryClient = useQueryClient();

    const [managingAccess, setManagingAccess] = useState<AdminQuestionnaireListItem | undefined>(undefined);
    const [transferring, setTransferring] = useState<AdminQuestionnaireListItem | undefined>(undefined);
    const [deleting, setDeleting] = useState<AdminQuestionnaireListItem | undefined>(undefined);

    if (questionnaires.length === 0) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyTitle>No questionnaires</EmptyTitle>
                    <EmptyDescription>Nothing has been created on the platform yet.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {questionnaires.map((questionnaire) => {
                    return (
                        <AdminQuestionnaireCard
                            key={questionnaire.id}
                            questionnaire={questionnaire}
                            onManageAccess={setManagingAccess}
                            onTransfer={setTransferring}
                            onDelete={setDeleting}
                        />
                    );
                })}
            </div>

            {!!managingAccess && (
                <ManageAccessDialog
                    open={!!managingAccess}
                    onOpenChange={(open) => {
                        if (!open) {
                            setManagingAccess(undefined);
                        }
                    }}
                    questionnaire={managingAccess}
                />
            )}

            {!!transferring && (
                <TransferOwnershipDialog
                    open={!!transferring}
                    onOpenChange={(open) => {
                        if (!open) {
                            setTransferring(undefined);
                        }
                    }}
                    questionnaire={transferring}
                />
            )}

            {!!deleting && (
                <DeleteQuestionnaireDialog
                    open={!!deleting}
                    onOpenChange={(open) => {
                        if (!open) {
                            setDeleting(undefined);
                        }
                    }}
                    questionnaire={deleting}
                    onDeleted={() => {
                        queryClient.invalidateQueries({ queryKey: adminKeys.questionnairesQueryKey() });
                    }}
                />
            )}
        </>
    );
}

type AdminQuestionnaireCardProps = {
    questionnaire: AdminQuestionnaireListItem;
    onManageAccess: (questionnaire: AdminQuestionnaireListItem) => void;
    onTransfer: (questionnaire: AdminQuestionnaireListItem) => void;
    onDelete: (questionnaire: AdminQuestionnaireListItem) => void;
};

function AdminQuestionnaireCard({ questionnaire, onManageAccess, onTransfer, onDelete }: AdminQuestionnaireCardProps) {
    const status = QUESTIONNAIRE_STATUS_BADGE[questionnaire.status];
    const name = ownerName(questionnaire.owner);

    return (
        <article className="flex flex-col gap-3 rounded-xl border p-4">
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1 overflow-hidden">
                    <h2 className="truncate font-medium">
                        <Link
                            to="/questionnaires/$questionnaireId"
                            params={{ questionnaireId: questionnaire.id }}
                            className="hover:underline"
                        >
                            {questionnaire.title}
                        </Link>
                    </h2>
                    {!!questionnaire.description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">{questionnaire.description}</p>
                    )}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon" aria-label="Questionnaire actions" />}
                    >
                        <EllipsisVerticalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem
                            onClick={() => {
                                onManageAccess(questionnaire);
                            }}
                        >
                            <UsersIcon />
                            Manage access
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                onTransfer(questionnaire);
                            }}
                        >
                            <ArrowLeftRightIcon />
                            Transfer ownership
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                                onDelete(questionnaire);
                            }}
                        >
                            <Trash2Icon />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <ListChecksIcon className="size-4" />
                    {questionnaire.questionsCount} questions
                </span>
                <span className="flex items-center gap-1.5">
                    <MessageSquareTextIcon className="size-4" />
                    {questionnaire.responsesCount} responses
                </span>
                <Link
                    to="/questionnaires/$questionnaireId/results"
                    params={{ questionnaireId: questionnaire.id }}
                    className="flex items-center gap-1.5 hover:text-foreground"
                >
                    <ChartColumnIcon className="size-4" />
                    Results
                </Link>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    {questionnaire.sharesCount > 0 && (
                        <Badge variant="outline">
                            <UsersIcon />
                            Shared with {questionnaire.sharesCount}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2" title={name}>
                    <Avatar size="sm">
                        <AvatarImage src={questionnaire.owner?.avatar_url ?? undefined} alt={name} />
                        <AvatarFallback>{getNameInitials(name)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm text-muted-foreground">{name}</span>
                </div>
            </div>
        </article>
    );
}

export { AdminQuestionnaires };
