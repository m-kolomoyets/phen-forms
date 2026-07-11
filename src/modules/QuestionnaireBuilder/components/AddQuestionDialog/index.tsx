import type { AddQuestionDialogProps } from './types';
import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import {
    QUESTION_TYPE_DESCRIPTION,
    QUESTION_TYPE_ICON,
    QUESTION_TYPE_LABEL,
    QUESTION_TYPES,
} from '@/lib/questions/constants';
import { Button } from '@/components/ui/Button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/Dialog';

function AddQuestionDialog({ onSelect }: AddQuestionDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button>
                        <PlusIcon />
                        Add question
                    </Button>
                }
            />
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Add a question</DialogTitle>
                    <DialogDescription>Choose a question type to add to this questionnaire.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 sm:grid-cols-2">
                    {QUESTION_TYPES.map((type) => {
                        const Icon = QUESTION_TYPE_ICON[type];

                        return (
                            <button
                                key={type}
                                type="button"
                                className="hover:bg-accent focus-visible:border-ring focus-visible:ring-ring/50 flex items-start gap-3 rounded-lg border p-3 text-left outline-none focus-visible:ring-3"
                                onClick={() => {
                                    setOpen(false);
                                    onSelect(type);
                                }}
                            >
                                <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md [&_svg]:size-5">
                                    <Icon />
                                </span>
                                <span className="flex flex-col gap-0.5">
                                    <span className="font-medium">{QUESTION_TYPE_LABEL[type]}</span>
                                    <span className="text-muted-foreground text-xs">
                                        {QUESTION_TYPE_DESCRIPTION[type]}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export { AddQuestionDialog };
