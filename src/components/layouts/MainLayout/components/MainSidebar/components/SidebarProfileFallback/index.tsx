import { SidebarMenu, SidebarMenuItem } from '@/components/Sidebar';
import { Skeleton } from '@/components/ui/Skeleton';

function SidebarProfileFallback() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <div className="flex items-center group-data-[state=expanded]:gap-2 h-16 px-2 motion-safe:transition-[width,height,padding] group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:px-0">
                    <Skeleton className="size-8 rounded-full shrink-0" />
                    <div className="grid flex-1 text-left text-sm leading-tight gap-2">
                        <Skeleton className="w-1/2 h-3" />
                        <Skeleton className="w-3/4 h-3" />
                    </div>
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

export { SidebarProfileFallback };
