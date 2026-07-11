import type { QuestionnaireCardProps } from './types';
import { Link } from '@tanstack/react-router';
import {
    ChartColumnIcon,
    EllipsisVerticalIcon,
    EyeIcon,
    LinkIcon,
    ListChecksIcon,
    MessageSquareTextIcon,
    PencilIcon,
    PencilLineIcon,
    SendIcon,
    Trash2Icon,
    UndoIcon,
    UsersIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { QUESTIONNAIRE_STATUS_BADGE } from '../../constants';

function QuestionnaireCard({
    questionnaire,
    onRename,
    onDelete,
    onToggleStatus,
    onPreview,
    onManageAccess,
}: QuestionnaireCardProps) {
    const status = QUESTIONNAIRE_STATUS_BADGE[questionnaire.status];
    const isDraft = questionnaire.status === 'draft';

    const handleCopyLink = async () => {
        const url = `${window.location.origin}/q/${questionnaire.id}`;

        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied.');
        } catch {
            toast.error('Copy failed.');
        }
    };

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
                    <DropdownMenuContent align="end" className="w-60">
                        <DropdownMenuItem
                            onClick={() => {
                                onToggleStatus(questionnaire);
                            }}
                        >
                            {isDraft ? <SendIcon /> : <UndoIcon />}
                            {isDraft ? 'Publish' : 'Unpublish'}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuLabel>View</DropdownMenuLabel>
                            <DropdownMenuItem
                                disabled={!onPreview}
                                onClick={() => {
                                    onPreview?.(questionnaire);
                                }}
                            >
                                <EyeIcon />
                                Preview as recipient
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                render={
                                    <Link
                                        to="/questionnaires/$questionnaireId/results"
                                        params={{ questionnaireId: questionnaire.id }}
                                    />
                                }
                            >
                                <ChartColumnIcon />
                                View results
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Edit</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => {
                                    onRename(questionnaire);
                                }}
                            >
                                <PencilLineIcon />
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                render={
                                    <Link
                                        to="/questionnaires/$questionnaireId"
                                        params={{ questionnaireId: questionnaire.id }}
                                    />
                                }
                            >
                                <PencilIcon />
                                Edit questions
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Access</DropdownMenuLabel>
                            <DropdownMenuItem onClick={handleCopyLink}>
                                <LinkIcon />
                                Copy link to fill
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={!onManageAccess}
                                onClick={() => {
                                    onManageAccess?.(questionnaire);
                                }}
                            >
                                <UsersIcon />
                                Manage access
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

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
            </div>

            <Badge variant={status.variant}>{status.label}</Badge>
        </article>
    );
}

export { QuestionnaireCard };
