import type { LoaderProps } from './types';
import { LoaderCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

function Loader({ className, ...props }: LoaderProps) {
    return <LoaderCircleIcon className={cn('motion-safe:animate-spin', className)} {...props} />;
}

export { Loader };
