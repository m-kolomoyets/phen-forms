import type { QuestionnaireCardProps } from './types';
import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { QUESTIONNAIRE_STATUS_BADGE } from '../../constants';

function QuestionnaireCard({ questionnaire, onEdit, onDelete }: QuestionnaireCardProps) {
    const status = QUESTIONNAIRE_STATUS_BADGE[questionnaire.status];

    return (
        <article className="flex flex-col gap-3 rounded-xl border p-4">
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1 overflow-hidden">
                    <h2 className="truncate font-medium">{questionnaire.title}</h2>
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
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => {
                                onEdit(questionnaire);
                            }}
                        >
                            <PencilIcon />
                            Edit
                        </DropdownMenuItem>
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
            <Badge variant={status.variant}>{status.label}</Badge>
        </article>
    );
}

export { QuestionnaireCard };
