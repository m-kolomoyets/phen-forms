import type { SkeletonProps } from './types';
import { cn } from '@/lib/utils/cn';

function Skeleton({ className, ...props }: SkeletonProps) {
    return <div className={cn('motion-safe:animate-pulse rounded-md bg-muted', className)} {...props} />;
}

export { Skeleton };
