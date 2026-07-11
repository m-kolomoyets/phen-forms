import type { Questionnaire } from '@/services/questionnaires/types';
import { CircleCheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type ThankYouScreenProps = {
    questionnaire: Questionnaire;
};

function ThankYouScreen({ questionnaire }: ThankYouScreenProps) {
    const hasBackground = Boolean(questionnaire.ending_bg_url);

    return (
        <div
            className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border bg-cover bg-center p-4 sm:p-8"
            style={hasBackground ? { backgroundImage: `url(${questionnaire.ending_bg_url})` } : undefined}
        >
            {hasBackground && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
            )}

            <div
                className={cn(
                    'relative flex w-full max-w-xl flex-col items-center gap-6 rounded-2xl border p-8 text-center shadow-xl sm:p-12',
                    hasBackground ? 'bg-background/85 backdrop-blur-md' : 'bg-card'
                )}
            >
                <span className="from-primary/15 to-primary/5 ring-primary/20 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br ring-1">
                    <CircleCheckIcon className="text-primary size-8" />
                </span>

                <div className="flex flex-col gap-3">
                    <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                        {questionnaire.ending_title ?? 'Thank you!'}
                    </h1>
                    <p className="text-muted-foreground text-pretty text-lg leading-relaxed">
                        {questionnaire.ending_description ?? 'Your response has been recorded.'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export { ThankYouScreen };
